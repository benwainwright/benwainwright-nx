import { BehaviorSubject, Observable, of } from "rxjs"
import { DataService } from "./data.service"


export class LocalStorageDataService<T extends { id: string }> implements DataService<T> {

  private data: BehaviorSubject<T[]>
  private key: string

  constructor(key: string) { 
    this.key = `ng-budget-${key}`
    this.data = new BehaviorSubject<T[]>(JSON.parse(localStorage.getItem(this.key) ?? '[]'))
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getAll(): Observable<T[]>  {
    return this.data.asObservable()
  }

  setAll(data: T[])  {
    localStorage.setItem(this.key, JSON.stringify(data))
    this.data.next(data)
    return of(void 0)
  }

  insertItem(item: T) {
    this.setAll([...this.data.value, item])
    return of(void 0)
  }

  updateItem(item: T) {
    const theData = [...this.data.value]
    const itemIndex = theData.findIndex(needle => needle.id === item.id)
    if(itemIndex === -1) {
      throw new Error('Data item not found')
    }
    theData[itemIndex] = item
    this.setAll(theData)
    return of(void 0)
  }

  removeItem(item: T) {
    const theData = [...this.data.value]
    const itemIndex = theData.findIndex(needle => needle.id === item.id)
    if(itemIndex === -1) {
      throw new Error('Data item not found')
    }
    theData.splice(itemIndex, 1)
    this.setAll(theData)
    return of(void 0)
  }
}
