\connect postgres

CREATE USER replivent WITH LOGIN nocreatedb nocreaterole ENCRYPTED PASSWORD 'replivent';
ALTER USER replivent SET search_path TO public;

CREATE DATABASE "replivent";
ALTER DATABASE  "replivent" OWNER TO "replivent";
