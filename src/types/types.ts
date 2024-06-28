export type BusinessType = {
    businessId: string
    waitTime: number
    name: string
    city: string
    state: string
    address: string
    location: number
    reviews: ReviewType[]
    categories: CategoryType[]
    averageStars: number
    isStarred: boolean
}

export type User = {
    userID: string
    name: string
    reviews: ReviewType[]
}

export type ReviewType = {
    reviewId: string
    stars: number
    date: Date
    text: string
    user: User
    business: BusinessType 
}

export type CategoryType = {
    name: string
    businesses: BusinessType[]
    businessCount: number
}