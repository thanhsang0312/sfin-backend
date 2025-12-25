import { Role } from "@common/enums/role.enum";

export const ROLE_PRIORITY: Record<Role, number> = {
    [Role.USER]: 1,
    [Role.PUBLISHER]: 2,
    [Role.ADMIN]: 3
};
