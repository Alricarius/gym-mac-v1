import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './config';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: config.NODE_ENV === 'development' ? true : false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
