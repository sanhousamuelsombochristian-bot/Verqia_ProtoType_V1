import { dateTimeShort } from '@/domain/format';
import type { BusinessEvent } from '@/domain/types';

export function EventList({ events }: { events: BusinessEvent[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {events.map((e, i) => (
        <div className="vq-event" key={`${e.at}-${i}`}>
          <span className={`vq-dot tone-${e.tone}`} />
          <div style={{ minWidth: 0 }}>
            <div className="title">{e.title}</div>
            <div className="detail">{e.detail}</div>
          </div>
          <div className="date">{dateTimeShort(e.at)}</div>
        </div>
      ))}
    </div>
  );
}
