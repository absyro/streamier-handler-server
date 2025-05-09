import { PartialType } from "@nestjs/mapped-types";

import { CreateHandlerDto } from "./create-handler.dto";

/**
 * Data Transfer Object for updating a handler.
 *
 * Extends CreateHandlerDto with all fields made optional. This allows partial
 * updates of handler properties.
 *
 * @class UpdateHandlerDto
 * @extends {PartialType<CreateHandlerDto>}
 * @see CreateHandlerDto
 */
export class UpdateHandlerDto extends PartialType(CreateHandlerDto) {}
