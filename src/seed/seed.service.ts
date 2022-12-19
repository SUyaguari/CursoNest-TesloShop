import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  
  constructor(
    private readonly producctService: ProductsService,
  ){}

  async runSeed(){

    await this.insertNewProductos();

    return 'SEED EXECUTED';
  }

  private async insertNewProductos(){
    
    await this.producctService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product =>{
      //this.producctService.create(product)
      insertPromises.push(this.producctService.create(product));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
