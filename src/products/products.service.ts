import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly producRepository: Repository<Product>,
  ){}

  async create(createProductDto: CreateProductDto) {

    try {

      //Se hace lo mismo en el entity
      // if(!createProductDto.slug){
      //   createProductDto.slug = createProductDto.title.toLowerCase().replaceAll(" ","_").replaceAll("'","")
      // }else{
      //   createProductDto.slug = createProductDto.slug.toLowerCase().replaceAll(" ","_").replaceAll("'","")
      // }
      
      const product = this.producRepository.create(createProductDto);
      await this.producRepository.save(product);

      return product;

    } catch (error) {

      this.handleExceptions(error);

    }

  }

  findAll(paginationDto:PaginationDto) {
    
    const {limit=5, offset=0} = paginationDto;

    return this.producRepository.find({
      take: limit,
      skip: offset,
      
    });
  }

  async findOne(term: string) {

    let product: Product;

    if( isUUID(term) ){
      product = await this.producRepository.findOneBy({ id: term});
    }else{
      //product = await this.producRepository.findOneBy({ slug: term});
      const queryBuilder = this.producRepository.createQueryBuilder();
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =: slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        }).getOne();
    }
    
    
    if(!product)
      throw new NotFoundException(`Product with id "${term}" not found`);
    
    return product; 

  }

  async update(id: string, updateProductDto: UpdateProductDto) {
   
    const product = await this.producRepository.preload({
      id: id,
      ...updateProductDto
    });

    if( !product )
      throw new NotFoundException(`Product with id: ${id} not found`);

   try {
    await this.producRepository.save(product);
   
    return product;

   } catch (error) {
    this.handleExceptions(error);
   }
  }

  async remove(id: string) {
   
    const Product = await this.findOne( id );

    await this.producRepository.remove(Product);

  }

  private handleExceptions( error: any){

    if( error.code === '23505')
      throw new BadRequestException(error.detail)

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs')

  }
}
