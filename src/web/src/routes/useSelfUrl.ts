import { useState } from 'react';

import { trpc } from '../utils/trpc';

let selfUrl: string | undefined = undefined;

export function useSelfUrl(): string | undefined {
  const shouldCall = !selfUrl;

  const [calledBefore] = useState(shouldCall);

  if (calledBefore) {
    const query = trpc.useQuery(['selfUrl']);
    if (query.data) {
      selfUrl = query.data.url;
    }
    return selfUrl;
  } else {
    return selfUrl;
  }
}
