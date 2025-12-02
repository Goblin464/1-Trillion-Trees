import { useThree } from '@react-three/fiber';
import React, { useRef, useMemo, useEffect } from 'react';
import {
  Group,
  MeshBasicMaterial,
  LineBasicMaterial,
  ShapeGeometry,
  DoubleSide,
  Vector3,
  Shape,
  Vector2,
  Color,
  Float32BufferAttribute,
  BufferGeometry,
  Mesh,
  Box3,
  Line,
  PerspectiveCamera,
} from 'three';


const DEFAULT_LAND_COLOR = '#1B7319';
const DEFAULT_BORDER_COLOR = '#ffffff';

type GeoJsonGeometry =
  | {
    type: 'Polygon';
    coordinates: number[][][];
  }
  | {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };

type GeoJsonFeature = {
  type: 'Feature';
  geometry: GeoJsonGeometry;
  properties?: Record<string, unknown>;
};

type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
};

interface WorldMapProps {
  geoJson: GeoJsonFeatureCollection;
}

export function WorldMap({ geoJson }: WorldMapProps) {
  const meshRef = useRef<Group>(null!);
  const baseSize = useRef<Vector3 | null>(null);
  const { camera, size}  = useThree() 
  const perspectiveCamera = camera as PerspectiveCamera
  
  const mapContent = useMemo(() => {
    const group = new Group();

    for (const feature of geoJson.features) {
      const geom = feature.geometry;
      if (!geom) continue;

      const colorValue =
        (feature.properties?.color as string | undefined) ?? DEFAULT_LAND_COLOR;
      const material = new MeshBasicMaterial({
        color: new Color(colorValue),
        side: DoubleSide,
        depthWrite: false,
      });

      if (geom.type === 'Polygon') {
        addPolygon(group, geom.coordinates, material);
      } else if (geom.type === 'MultiPolygon') {
        for (const polygon of geom.coordinates) {
          addPolygon(group, polygon, material);
        }
      }
    }

    centerMesh(group); // Centering logic needs to be adapted for R3F
    return group;
  }, [geoJson]);

  useEffect(() => {
    if (meshRef.current) {
      centerMesh(meshRef.current);
    }
  }, [mapContent]);

  function lonLatToXY(lon: number, lat: number): Vector2 {
    const x = lon / 180;
    const y = lat / 90;

    const worldScaleX = 1.8;
    const worldScaleY = 1.0;

    return new Vector2(x * worldScaleX, y * worldScaleY);
  }

  function addPolygon(
    group: Group,
    rings: number[][][],
    material: MeshBasicMaterial,
  ) {
    if (!rings.length) return;

    const [outerRing] = rings;
    if (outerRing.length < 3) return;

    const shape = new Shape();

    outerRing.forEach(([lon, lat], index) => {
      const { x, y } = lonLatToXY(lon, lat);
      if (index === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    });
    shape.closePath();

    const geometry = new ShapeGeometry(shape);
    const mesh = new Mesh(geometry, material); 
    group.add(mesh);

    addPolygonBorders(group, outerRing);
  }

  function addPolygonBorders(group: Group, ring: number[][]) {
    if (ring.length < 2) return;

    const positions: number[] = [];
    ring.forEach(([lon, lat]) => {
      const { x, y } = lonLatToXY(lon, lat);
      positions.push(x, y, 0);
    });
    const [firstLon, firstLat] = ring[0];
    const { x, y } = lonLatToXY(firstLon, firstLat);
    positions.push(x, y, 0.01);

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

    const line = new Line( 
      geometry,
      new LineBasicMaterial({
        color: DEFAULT_BORDER_COLOR,
        linewidth: 1,
      }),
    );

    group.add(line);
  }

  function centerMesh(mesh: Group) {
    const box = new Box3().setFromObject(mesh);
    const center = box.getCenter(new Vector3());
    mesh.position.sub(center);
    baseSize.current = box.getSize(new Vector3());
  }

  const fitToCamera = () => {
    if (!meshRef.current || !baseSize.current) return

    const distance = Math.abs(perspectiveCamera.position.z - meshRef.current.position.z)
    const verticalFovInRad = (perspectiveCamera.fov * Math.PI) / 180

    const visibleHeight = 2 * Math.tan(verticalFovInRad / 2) * distance
    const visibleWidth = visibleHeight * perspectiveCamera.aspect

    const scaleFactor = Math.min(
      visibleWidth / baseSize.current.x,
      visibleHeight / baseSize.current.y
    )

    meshRef.current.scale.setScalar(scaleFactor)
  }
  useEffect(() => {
    fitToCamera();
  }, [mapContent]);


  useEffect(() => {
    fitToCamera();
  }, [size.width, size.height]);


  return (
    <group ref={meshRef}>
      <primitive object={mapContent} dispose={null} />
    </group>
  );
}

