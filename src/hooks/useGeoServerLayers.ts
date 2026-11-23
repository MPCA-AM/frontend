import { useCallback, useEffect, useState } from 'react';
import type { GeoLayer } from '@/layers/types';
import { parseWmsLayers } from '@/utils/wms';

type GeoServerStatus = 'loading' | 'ready' | 'error';

export function useGeoServerLayers(geoserver: string, workspace: string) {
  const [layers, setLayers] = useState<GeoLayer[]>([]);
  const [status, setStatus] = useState<GeoServerStatus>('loading');

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      const url = `${geoserver}/${workspace}/ows?service=WMS&request=GetCapabilities&_=${Date.now()}`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('GeoServer indisponible');
      }

      const xmlText = await response.text();
      setLayers(parseWmsLayers(xmlText));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [geoserver, workspace]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { layers, setLayers, status, reload };
}
