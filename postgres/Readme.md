# Postgres

This database setup is based on the configurations used by [Immich](https://github.com/immich-app/base-images).

It features a customized PostgreSQL image with the following enhancements:
- Vector Support: Includes pgvector and VectorChord for efficient similarity searches.
- Performance Tuning: Provides optimized configuration templates for both SSD and HDD storage types.
- Health Monitoring: Includes dedicated healthcheck scripts to ensure database reliability within the Docker stack.