# Changelog

## 1.0.0 (2025-05-16)


### Features

* add Code of Conduct, Contributing Guide, README, and Security Policy documents for community guidelines and project contribution clarity ([a519ca0](https://github.com/absyro/streamier-handler-server/commit/a519ca05cfd2f56e41d8a06330b427048f0bcb89))
* add Components module with controller and service for managing handler components ([2a25db6](https://github.com/absyro/streamier-handler-server/commit/2a25db6ef6f1175a62bbda0ed9a658ec65250f4d))
* add endpoint to retrieve handler authentication token and refactor findOne method for clarity ([1d74a4f](https://github.com/absyro/streamier-handler-server/commit/1d74a4f48f7852b9b9ac6de56de1ed7050d1ef46))
* add http-status-codes package and enhance API responses with detailed error schemas for better client handling ([37f0b6d](https://github.com/absyro/streamier-handler-server/commit/37f0b6d6f521596abd7627d1f5559f04cba3397a))
* add listStreams endpoint to StreamsController and implement corresponding service method for retrieving user streams ([fea8fdd](https://github.com/absyro/streamier-handler-server/commit/fea8fddd7ae05348e303cf4efc72e7e8058e6253))
* add Log class for structured logging and update Stream class to utilize new Log type ([e3d9a79](https://github.com/absyro/streamier-handler-server/commit/e3d9a79604577a63796f0375464c6bbb55ac2139))
* add online status filter to SearchHandlerDto and update HandlersService to support querying by online status ([82bf8d9](https://github.com/absyro/streamier-handler-server/commit/82bf8d94855964ec189776b9c196fd834a1ce659))
* add tags property to CreateHandlerDto and update HandlersService to handle tags ([9657ffc](https://github.com/absyro/streamier-handler-server/commit/9657ffc11c1ae7b453bc647a65d1a2193ef3e0b2))
* add TODO for implementing icons8 API for handler icon validations ([9a4e696](https://github.com/absyro/streamier-handler-server/commit/9a4e69622fb869a9ce2ca568242cc1cba6911f7e))
* add userId filter to SearchHandlerDto and update HandlersService for user-specific queries ([792ef24](https://github.com/absyro/streamier-handler-server/commit/792ef244e8286a630ec6e813f7239c5c19361413))
* enhance CommonService and HandlersController with improved error handling and new endpoint for retrieving handler components ([b272066](https://github.com/absyro/streamier-handler-server/commit/b272066ed9186ec3c3672b68af35b969a2d27afd))
* enhance deleteStream endpoint with no content response and HTTP status code for improved API clarity ([fde1506](https://github.com/absyro/streamier-handler-server/commit/fde1506ffb37ba1326563feabe1df904bd861047))
* implement DTOs for stream creation and update, refactor StreamsController and StreamsService to utilize new data transfer objects ([3a741a7](https://github.com/absyro/streamier-handler-server/commit/3a741a7a397b057d588e494e3d790c2c9a5afbc5))
* implement online/offline status tracking for handlers and initialize all handlers as offline on module startup ([318578f](https://github.com/absyro/streamier-handler-server/commit/318578ffc1d503cb8dc97140baad9db402b23900))
* implement search functionality in HandlersService and add SearchHandlerDto for filtering results ([50e523a](https://github.com/absyro/streamier-handler-server/commit/50e523abbb6b23774f33dbb531ef7052d5298b21))
* implement stream validation and enhance stream management with new classes and enums ([7f4077a](https://github.com/absyro/streamier-handler-server/commit/7f4077af13bddbee635abb5b0e658918fec330d3))
* integrate express-partial-response for optimized response handling and remove ListStreamsDto to simplify stream retrieval ([9224278](https://github.com/absyro/streamier-handler-server/commit/9224278b0931c62c39a4293e4afb19e65a5c800e))
* update API documentation examples for session ID and handler ID, and enhance log and stream classes with additional properties ([dd4ef33](https://github.com/absyro/streamier-handler-server/commit/dd4ef333bf1c321e9b9c46764884f86b55201d82))


### Bug Fixes

* add IsNotEmpty validation to optional fields in SearchHandlerDto for improved data integrity ([f9231e2](https://github.com/absyro/streamier-handler-server/commit/f9231e20652e9184959d0855875ed2671bbda715))
* add IsNotEmpty validation to required fields in CreateHandlerDto for improved data integrity ([2ba8bc3](https://github.com/absyro/streamier-handler-server/commit/2ba8bc39a1c02cca51d802456500f8af705db6e2))
* add optional terms property to CreateHandlerDto and Handler entity for improved clarity and compliance with community guidelines ([8daf3ca](https://github.com/absyro/streamier-handler-server/commit/8daf3ca616a7bbbed04b922f8371a32d4475d22e))
* correct endpoint path for user profile retrieval to ensure accurate API routing ([a8b7284](https://github.com/absyro/streamier-handler-server/commit/a8b7284a63c3f05b33a6b74f2c5150bed818442f))
* enhance error handling in StreamsService and StreamsController by providing detailed messages for BadGatewayException and adding API response schema ([bf3ac54](https://github.com/absyro/streamier-handler-server/commit/bf3ac540ba79338bde9d993a42a98b08d6fe0b71))
* enhance StreamsController and StreamsService by ensuring proper response handling and validation in updateStream method ([e3468f4](https://github.com/absyro/streamier-handler-server/commit/e3468f43b38267eb68594d69fe66ddb15ee33554))
* ensure token is converted to string in HandlersController for consistent socket authentication ([52df8d8](https://github.com/absyro/streamier-handler-server/commit/52df8d89d4f7c09ebebff21a735037f8f2626ce1))
* improve error handling in StreamsService by refining response validation in _emitToHandler method ([dce376f](https://github.com/absyro/streamier-handler-server/commit/dce376f809a7ca4426e536502a9cbe24bb03db8f))
* increase maximum limits for handlers, names, and logs, and add terms property in CreateHandlerDto for improved clarity and consistency ([d2c9314](https://github.com/absyro/streamier-handler-server/commit/d2c931461867397b7b5ca3c8a0174a96ad9e4adc))
* reduce maximum length for handler names and update related validations in DTOs and entities for consistency ([77bc082](https://github.com/absyro/streamier-handler-server/commit/77bc08253aca7276c0f6145dfea732120fa98113))
* remove error messages from NotFoundException for cleaner error handling in HandlersService and StreamsService ([845e04f](https://github.com/absyro/streamier-handler-server/commit/845e04f0611e86610ed195caf64adc7572e92866))
* replace BadRequestException with ForbiddenException for exceeding handler limit ([1a04510](https://github.com/absyro/streamier-handler-server/commit/1a045109291cdc7883f5c81179494eb7b456eee9))
* set API version dynamically from package.json in main.ts for improved maintainability ([146ce2f](https://github.com/absyro/streamier-handler-server/commit/146ce2fa11d790782fa36a99e7d0ae15e2389f92))
* update API property examples in Node and Stream classes to use camelCase for consistency ([8cf13c1](https://github.com/absyro/streamier-handler-server/commit/8cf13c1923e3aebcc366ac6927a924870d286692))
* update error response schema in HandlersController and StreamsController to include detailed message and error properties for improved clarity ([cedc716](https://github.com/absyro/streamier-handler-server/commit/cedc71630f6d435e84b9d14687f6f99234613930))
* update error response schema in HandlersController and StreamsController to include error and message properties, and enhance error handling in HandlersService for improved clarity ([e75dd7f](https://github.com/absyro/streamier-handler-server/commit/e75dd7fdbbae2cb7dee0ea871ae63c80d423ffee))
* update example timestamps in Handler entity to use current ISO format ([7a52436](https://github.com/absyro/streamier-handler-server/commit/7a5243626bf446a5b2dbe13380bdf9db9a558988))
* update import from @nestjs/mapped-types to @nestjs/swagger in update-handler.dto.ts ([a9b50da](https://github.com/absyro/streamier-handler-server/commit/a9b50da94da482beb7c5f6e582b6ec65930a82a5))
* update maximum handlers limit in HandlersService and adjust error message example in HandlersController for improved clarity ([061f871](https://github.com/absyro/streamier-handler-server/commit/061f871c8d4b5f0fc8473c9e207b0fa59bf0964d))
* update Node ID type from number to string and adjust related validations for consistency in DTOs ([f8bfdd5](https://github.com/absyro/streamier-handler-server/commit/f8bfdd5bf2dfe8ba2ee29cc2f40228b7f97238d5))
* update PostgreSQL requirement in README for clarity ([d7cdfb4](https://github.com/absyro/streamier-handler-server/commit/d7cdfb4b5791d526642cff42be49271a52e5b62b))
* update Redoc setup path from "/api/docs" to "/docs" for improved routing ([e3cf450](https://github.com/absyro/streamier-handler-server/commit/e3cf450e7db33af1f6f8da538a0b62ea4bf2e502))
* update SQL query in CommonService to reference user_sessions for accurate session retrieval ([7cbe4bd](https://github.com/absyro/streamier-handler-server/commit/7cbe4bd16be4f66308e4354af5443ed500a7bc51))
* update terms of service and contact URL in main.ts for accuracy ([0195ee7](https://github.com/absyro/streamier-handler-server/commit/0195ee71dbdf5c7e934d3a35e5d81f30a5998374))
* update terms of service URL and versioning in main.ts for consistency ([9fd69d7](https://github.com/absyro/streamier-handler-server/commit/9fd69d724223caced899f2f87bd6f7e9f08b3a80))
