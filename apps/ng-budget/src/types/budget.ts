import { PotPlan } from './pot-plan'

export interface PaymentPlan {
    startDate: Date
    endDate: Date
    potPlans: PotPlan[]
}

export interface Budget {
    id: string
    startDate: Date
    endDate: Date
    potPlans: PotPlan[]
    surplus: number
}
