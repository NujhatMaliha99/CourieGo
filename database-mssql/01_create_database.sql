USE master;
GO

IF DB_ID('courier_management') IS NULL
BEGIN
    CREATE DATABASE courier_management;
END;
GO

USE courier_management;
GO
