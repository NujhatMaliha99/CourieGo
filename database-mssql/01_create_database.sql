USE master;

IF DB_ID('courier_management') IS NULL
BEGIN
    CREATE DATABASE courier_management;
END;

USE courier_management;
