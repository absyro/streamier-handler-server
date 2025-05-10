# Changelog

## 1.0.0 (2025-05-10)


### Features

* add Code of Conduct, Contributing Guide, README, and Security Policy documents for community guidelines and project contribution clarity ([a519ca0](https://github.com/absyro/streamier-handler-server/commit/a519ca05cfd2f56e41d8a06330b427048f0bcb89))
* add endpoint to retrieve handler authentication token and refactor findOne method for clarity ([1d74a4f](https://github.com/absyro/streamier-handler-server/commit/1d74a4f48f7852b9b9ac6de56de1ed7050d1ef46))
* add Log class for structured logging and update Stream class to utilize new Log type ([e3d9a79](https://github.com/absyro/streamier-handler-server/commit/e3d9a79604577a63796f0375464c6bbb55ac2139))
* add online status filter to SearchHandlerDto and update HandlersService to support querying by online status ([82bf8d9](https://github.com/absyro/streamier-handler-server/commit/82bf8d94855964ec189776b9c196fd834a1ce659))
* add tags property to CreateHandlerDto and update HandlersService to handle tags ([9657ffc](https://github.com/absyro/streamier-handler-server/commit/9657ffc11c1ae7b453bc647a65d1a2193ef3e0b2))
* add userId filter to SearchHandlerDto and update HandlersService for user-specific queries ([792ef24](https://github.com/absyro/streamier-handler-server/commit/792ef244e8286a630ec6e813f7239c5c19361413))
* enhance deleteStream endpoint with no content response and HTTP status code for improved API clarity ([fde1506](https://github.com/absyro/streamier-handler-server/commit/fde1506ffb37ba1326563feabe1df904bd861047))
* implement DTOs for stream creation and update, refactor StreamsController and StreamsService to utilize new data transfer objects ([3a741a7](https://github.com/absyro/streamier-handler-server/commit/3a741a7a397b057d588e494e3d790c2c9a5afbc5))
* implement online/offline status tracking for handlers and initialize all handlers as offline on module startup ([318578f](https://github.com/absyro/streamier-handler-server/commit/318578ffc1d503cb8dc97140baad9db402b23900))
* implement search functionality in HandlersService and add SearchHandlerDto for filtering results ([50e523a](https://github.com/absyro/streamier-handler-server/commit/50e523abbb6b23774f33dbb531ef7052d5298b21))
* implement stream validation and enhance stream management with new classes and enums ([7f4077a](https://github.com/absyro/streamier-handler-server/commit/7f4077af13bddbee635abb5b0e658918fec330d3))
* update API documentation examples for session ID and handler ID, and enhance log and stream classes with additional properties ([dd4ef33](https://github.com/absyro/streamier-handler-server/commit/dd4ef333bf1c321e9b9c46764884f86b55201d82))


### Bug Fixes

* correct endpoint path for user profile retrieval to ensure accurate API routing ([a8b7284](https://github.com/absyro/streamier-handler-server/commit/a8b7284a63c3f05b33a6b74f2c5150bed818442f))
* ensure token is converted to string in HandlersController for consistent socket authentication ([52df8d8](https://github.com/absyro/streamier-handler-server/commit/52df8d89d4f7c09ebebff21a735037f8f2626ce1))
* set API version dynamically from package.json in main.ts for improved maintainability ([146ce2f](https://github.com/absyro/streamier-handler-server/commit/146ce2fa11d790782fa36a99e7d0ae15e2389f92))
* update import from @nestjs/mapped-types to @nestjs/swagger in update-handler.dto.ts ([a9b50da](https://github.com/absyro/streamier-handler-server/commit/a9b50da94da482beb7c5f6e582b6ec65930a82a5))
* update PostgreSQL requirement in README for clarity ([d7cdfb4](https://github.com/absyro/streamier-handler-server/commit/d7cdfb4b5791d526642cff42be49271a52e5b62b))
* update Redoc setup path from "/api/docs" to "/docs" for improved routing ([e3cf450](https://github.com/absyro/streamier-handler-server/commit/e3cf450e7db33af1f6f8da538a0b62ea4bf2e502))
* update SQL query in CommonService to reference user_sessions for accurate session retrieval ([7cbe4bd](https://github.com/absyro/streamier-handler-server/commit/7cbe4bd16be4f66308e4354af5443ed500a7bc51))
* update terms of service and contact URL in main.ts for accuracy ([0195ee7](https://github.com/absyro/streamier-handler-server/commit/0195ee71dbdf5c7e934d3a35e5d81f30a5998374))
* update terms of service URL and versioning in main.ts for consistency ([9fd69d7](https://github.com/absyro/streamier-handler-server/commit/9fd69d724223caced899f2f87bd6f7e9f08b3a80))
