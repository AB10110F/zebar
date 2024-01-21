import { z } from 'zod';

import { ProviderType } from '../provider-type.model';

export const GlazewmProviderConfigSchema = z.object({
  type: z.literal(ProviderType.GLAZEWM),
});

export type GlazewmProviderConfig = z.infer<
  typeof GlazewmProviderConfigSchema
>;
