export class LateDebtor {
    debtorId: string
    debtorName: string
    phoneNumbers: string[]
    lateDebt: LateProduct[]
}

export class LateProduct {
    debt: string
    debtName: string
    term: string
    monthlyPayment: number

}

