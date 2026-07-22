import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  public data: any = [
    {
      id: 1,
      name: "gus-gi",
      data: {

      },
      template: "xyz",
      active: true
    },
    {
      id: 2,
      name: "our",
      data: {

      },
      template: "our",
      active: true
    },
    {
      id: 3,
      name: "red",
      data: {},
      template: "red",
      active: true
    },
    {
      id: 4,
      name: "g-n",
      data: {},
      template: "g-n",
      active: true
    },
    {
      id: 5,
      name: "g-g",
      data: {},
      template: "g-g",
      active: true
    }
  ]
  constructor() { }

  public getData() {
    return this.data;
  }

  public getDataByName({ name }: { name: string }) {
    return this.data.find((item: any) => (item.name === name && item.active));
  }
}
