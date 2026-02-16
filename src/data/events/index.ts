import { cosmicEvents } from './cosmic';
import { geologicalEvents } from './geological';
import { ancientEvents } from './ancient';
import { medievalEvents } from './medieval';
import { earlyModernEvents } from './earlymodern';
import { modernEvents } from './modern';
import { futureEvents } from './future';
import type { SpacetimeEvent } from '@/lib/events/types';

export const allEvents: SpacetimeEvent[] = [
  ...cosmicEvents,
  ...geologicalEvents,
  ...ancientEvents,
  ...medievalEvents,
  ...earlyModernEvents,
  ...modernEvents,
  ...futureEvents,
];

export {
  cosmicEvents,
  geologicalEvents,
  ancientEvents,
  medievalEvents,
  earlyModernEvents,
  modernEvents,
  futureEvents,
};
