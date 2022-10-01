import { BehaviorSubject, Observable, of } from "rxjs"
import { DataSeriesService } from "./data-series.service"


export class LocalStorageDataSeriesService<T extends { id: string }> implements DataSeriesService<T> {

  private data: BehaviorSubject<T[]>
  private key: string
  private deserialise: (data: T) => T

  constructor(key: string, deserialise?: (data: T) => T) { 
    this.key = `ng-budget-${key}`
    this.deserialise = deserialise ?? ((item) => item)
    const data: T[] = JSON.parse(localStorage.getItem(this.key) ?? '[]')
    this.data = new BehaviorSubject<T[]>(data.map(budget => this.deserialise(budget)))
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
