import { Neo4jGraphQL } from '@neo4j/graphql';
import { ApolloServer, gql } from 'apollo-server-lambda';
import dotenv from 'dotenv';
import neo4j from 'neo4j-driver';
import {Neo4jGraphQLAuthJWKSPlugin} from '@neo4j/graphql-plugin-auth';
// const { Neo4jGraphQLAuthJWKSPlugin } = pkg;

const resolvers = {
    Business: {
        waitTime: () => {
            var options = [0, 5, 10, 15, 30, 45];
            return options[Math.floor(Math.random() * options.length)];
        }
    }
}

const graphQLSchema = gql(`
    type Business {
        businessId: ID!
        waitTime: Int! @customResolver
        name: String!
        city: String!
        state: String!
        address: String!
        location: Point!
        reviews: [Review!]! @relationship(type: "REVIEWS", direction: IN)
        categories: [Category!]! @relationship(type: "IN_CATEGORY", direction: OUT)
        averageStars: Float
            # @auth(rules: [{isAuthenticated: true}])
            @cypher(
                statement: """
                    MATCH (this)<-[:REVIEWS]-(r:Review) 
                    RETURN avg(r.stars) AS averageStars
                """,
                columnName: "averageStars"
            )
        recommanded(first: Int = 1): [Business!]!
            @cypher(
                statement: """
                    MATCH (this)<-[:REVIEWS]-(:Review)<-[:WROTE]-(u:User) 
                    MATCH (u)-[:WROTE]->(:Review)-[:REVIEWS]->(rec:Business) 
                    WITH rec, COUNT(*) AS Score 
                    RETURN rec ORDER BY Score DESC LIMIT $first
                """,
                columnName: "rec"
            )
        fuzzyBusinessName(searchString: String): [Business]
            @cypher(
                statement: """
                    CALL {
                        WITH $searchString AS searchString
                        WITH searchString WHERE searchString <> ''
                        CALL db.index.fulltext.queryNodes('businessNameIndex', searchString + '~')
                        YIELD node
                        RETURN collect(node) AS nodes
                        UNION
                        RETURN [] AS nodes
                    }
                    UNWIND nodes AS node
                    RETURN node
                """,
                columnName: "node"
            )
        qualityBusinesses: [Business!]!
            @cypher(
                statement: """
                MATCH (b:Business)<-[:REVIEWS]-(r:Review)
                WITH b, COLLECT(r) AS reviews
                WHERE all(r IN reviews WHERE r.stars > 4.0)
                RETURN b
                """
            )
            # @auth(rules: [{ roles: ["analyst"] }])
    }

    type User {
        userId: ID!
        name: String!
        reviews: [Review!]! @relationship(type: "WROTE", direction: OUT)
    }
    
    type Review {
        reviewId: ID!
        stars: Float!
        date: Date!
        text: String
        user: User @relationship(type: "WROTE", direction: IN)
        business: Business! @relationship(type: "REVIEWS", direction: OUT)
        fuzzyReviewName(searchString: String): [Review]
            @cypher(
                statement: """
                    CALL db.index.fulltext.queryNodes('reviewNameIndex', $searchString+'~')
                    YIELD node RETURN node
                """,
                columnName: "node"
            )
    }
    type Category {
        name: String!
        businesses: [Business!]! @relationship(type: "IN_CATEGORY", direction: IN)
        businessCount: Int
            @cypher(
                statement: """
                    MATCH (this)<-[:IN_CATEGORY]-(b:Business) 
                    RETURN COUNT(b) AS businessCount
                """,
                columnName: "businessCount"
            )
    }
`)

const driver = neo4j.driver(
    "bolt://127.0.0.1:7687",
    neo4j.auth.basic(`${process.env.NEO4J_USER}`, `${process.env.NEO4J_PASSWORD}`),
    { encrypted: 'ENCRYPTION_OFF' }
);

class CustomNeo4jGraphQLAuthJWKSPlugin extends Neo4jGraphQLAuthJWKSPlugin {
    tryToResolveKeys(req: any): void {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        if (token) {
            console.log('Token found:', token);
        } else {
            console.log('No token provided');
        }
    }
}

// const startServer = async () => {
//     try {
//         // await generateSchemaFile();

//         // const introspectedTypeDefs = fs
//         //     .readFileSync(path.join(dirname, "schema.graphql"))
//         //     .toString("utf-8");

//         // const  mergedTypeDefs = mergeTypeDefs([graphQLSchema, introspectedTypeDefs])

//         const neoSchema = new Neo4jGraphQL({ 
//             typeDefs: graphQLSchema, 
//             resolvers, 
//             driver,
//             plugins: {
//                 auth: new CustomNeo4jGraphQLAuthJWKSPlugin({
//                     jwksEndpoint: "https://dev-nywym3z4nbfyxrk0.us.auth0.com/.well-known/jwks.json"
//                 })
//             }
//         });
//         const schema = await neoSchema.getSchema();


//         const server = new ApolloServer({
//             schema,
//             context: ({ req }) => ({
//                 driver,
//                 req
//             })
//         });

//         const { url } = await server.listen();
//         console.log(`GraphQL server ready at ${url}`);
//     } catch (error) {
//         console.error('Error starting the server:', error);
//     }

//     try {
//         await driver.verifyConnectivity();
//         console.log('Connected to Neo4j');
//     } catch (err) {
//         console.error('Error connecting to Neo4j:', err);
//     }
// };

// startServer().catch(error => {
//     console.error('Unhandled error:', error);
// });


const neoSchema = new Neo4jGraphQL({
    typeDefs: graphQLSchema,
    resolvers,
    driver,
    plugins: {
        auth: new CustomNeo4jGraphQLAuthJWKSPlugin({
            jwksEndpoint: "https://grandstack.auth0.com/.well-known/jwks.json",
        }),
    },
});
const initServer = async () => {
    return await neoSchema.getSchema().then((schema) => {
        const server = new ApolloServer({
            schema,
            context: ({ event }) => ({ req: event }),
        });
        const serverHandler = server.createHandler();
        return serverHandler;
    });
};
// @ts-ignore
exports.handler = async (event, context, callback) => {
    const serverHandler = await initServer();
    return serverHandler(
        {
            ...event,
            requestContext: event.requestContext || {},
        },
        context,
        callback
    );
};