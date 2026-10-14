/**
 * OrganicVegetationSystem.ts - Next-Gen Photorealistic Instanced Vegetation System
 *
 * Provides high-performance 3D vegetation for racing circuits:
 * - Curved multi-blade grass tufts
 * - Mediterranean Racing Pines, European Broadleaf Oaks, Italian Cypresses, and Dense Shrubs
 * - 100% Hardware Instanced rendering (Draw calls cut from thousands to single digits)
 * - Zero collision interference on active track surface
 */

import * as THREE from 'three';
import { safeMergeBufferGeometries } from '../utils/GeometryUtils';

export interface TreePlacementConfig {
  x: number;
  z: number;
  scale: number;
  yaw: number;
  type: 'pine' | 'oak' | 'cypress' | 'bush';
}

export interface VegetationMaterials {
  trunkMat: THREE.Material;
  pineFoliageMat: THREE.Material;
  oakFoliageMat: THREE.Material;
  cypressFoliageMat: THREE.Material;
  bushMat: THREE.Material;
}

export class OrganicVegetationSystem {
  private static cachedTuftGeo: THREE.BufferGeometry | null = null;
  private static cachedPineGeos: { trunk: THREE.BufferGeometry; foliage: THREE.BufferGeometry } | null = null;
  private static cachedOakGeos: { trunk: THREE.BufferGeometry; foliage: THREE.BufferGeometry } | null = null;
  private static cachedCypressGeos: { trunk: THREE.BufferGeometry; foliage: THREE.BufferGeometry } | null = null;
  private static cachedBushGeo: THREE.BufferGeometry | null = null;

  /**
   * Generates a curved grass tuft prototype geometry with 3 cross-planes.
   */
  public static createCurvedGrassTuftGeometry(): THREE.BufferGeometry {
    if (this.cachedTuftGeo) return this.cachedTuftGeo;

    const planes: THREE.BufferGeometry[] = [];
    const bladeW = 0.42;
    const bladeH = 0.48;

    for (let i = 0; i < 3; i++) {
      const plane = new THREE.PlaneGeometry(bladeW, bladeH, 1, 2);
      // Anchor at base
      plane.translate(0, bladeH * 0.5, 0);

      // Curve upper vertices slightly outwards
      const pos = plane.attributes.position as THREE.BufferAttribute;
      for (let j = 0; j < pos.count; j++) {
        const y = pos.getY(j);
        if (y > bladeH * 0.4) {
          const zOffset = (y / bladeH) * 0.08 * (i === 1 ? -1 : 1);
          pos.setZ(j, pos.getZ(j) + zOffset);
        }
      }

      plane.rotateY((i * Math.PI) / 3);
      planes.push(plane);
    }

    const merged = safeMergeBufferGeometries(planes);
    planes.forEach((p) => p.dispose());

    this.cachedTuftGeo = merged || new THREE.PlaneGeometry(bladeW, bladeH);
    return this.cachedTuftGeo;
  }

  /**
   * Pre-generates merged prototype geometries for Mediterranean Racing Pine.
   */
  public static createPineGeometries(): { trunk: THREE.BufferGeometry; foliage: THREE.BufferGeometry } {
    if (this.cachedPineGeos) {
      return this.cachedPineGeos;
    }

    // 1. Slender tall trunk with subtle organic bend
    const trunk = new THREE.CylinderGeometry(0.32, 0.52, 9.5, 8);
    trunk.translate(0, 4.75, 0);

    // 2. Distinctive high umbrella canopy (multi-tiered horizontal tiers)
    const folGeos: THREE.BufferGeometry[] = [];
    const tiers = [
      { y: 7.2, r: 4.8, h: 2.2 },
      { y: 8.6, r: 4.2, h: 2.0 },
      { y: 9.8, r: 3.2, h: 1.8 },
      { y: 10.8, r: 1.8, h: 1.4 },
    ];

    tiers.forEach((t) => {
      const cone = new THREE.ConeGeometry(t.r, t.h, 7);
      cone.translate(0, t.y, 0);
      folGeos.push(cone);
    });

    const foliageMerged = safeMergeBufferGeometries(folGeos);
    folGeos.forEach((g) => g.dispose());

    this.cachedPineGeos = {
      trunk,
      foliage: foliageMerged || new THREE.ConeGeometry(4.0, 4.0, 7),
    };

    return this.cachedPineGeos;
  }

  /**
   * Pre-generates merged prototype geometries for Broadleaf European Oak.
   */
  public static createOakGeometries(): { trunk: THREE.BufferGeometry; foliage: THREE.BufferGeometry } {
    if (this.cachedOakGeos) {
      return this.cachedOakGeos;
    }

    // Gnarled wide trunk
    const trunk = new THREE.CylinderGeometry(0.55, 0.85, 4.8, 8);
    trunk.translate(0, 2.4, 0);

    // Volumetric organic crown clusters
    const folGeos: THREE.BufferGeometry[] = [];
    const crowns = [
      { x: 0, y: 5.6, z: 0, r: 3.8 },
      { x: -1.8, y: 4.6, z: 1.2, r: 2.9 },
      { x: 1.9, y: 4.8, z: -0.9, r: 2.8 },
      { x: 0.8, y: 5.2, z: 1.8, r: 2.6 },
      { x: -1.2, y: 5.0, z: -1.6, r: 2.7 },
    ];

    crowns.forEach((c) => {
      const sphere = new THREE.DodecahedronGeometry(c.r, 1);
      sphere.translate(c.x, c.y, c.z);
      folGeos.push(sphere);
    });

    const foliageMerged = safeMergeBufferGeometries(folGeos);
    folGeos.forEach((g) => g.dispose());

    this.cachedOakGeos = {
      trunk,
      foliage: foliageMerged || new THREE.DodecahedronGeometry(4.2, 1),
    };

    return this.cachedOakGeos;
  }

  /**
   * Pre-generates merged prototype geometries for Slender Italian Cypress.
   */
  public static createCypressGeometries(): { trunk: THREE.BufferGeometry; foliage: THREE.BufferGeometry } {
    if (this.cachedCypressGeos) {
      return this.cachedCypressGeos;
    }

    // Short stout base trunk
    const trunk = new THREE.CylinderGeometry(0.24, 0.38, 2.6, 6);
    trunk.translate(0, 1.3, 0);

    // Tall slender columnar flame crown
    const folGeos: THREE.BufferGeometry[] = [];
    const cone1 = new THREE.ConeGeometry(1.4, 8.2, 7);
    cone1.translate(0, 5.8, 0);
    folGeos.push(cone1);

    const cone2 = new THREE.ConeGeometry(1.65, 5.4, 7);
    cone2.translate(0, 4.4, 0);
    folGeos.push(cone2);

    const foliageMerged = safeMergeBufferGeometries(folGeos);
    folGeos.forEach((g) => g.dispose());

    this.cachedCypressGeos = {
      trunk,
      foliage: foliageMerged || new THREE.ConeGeometry(1.5, 8.0, 7),
    };

    return this.cachedCypressGeos;
  }

  /**
   * Pre-generates merged prototype geometry for Organic Bush Cluster.
   */
  public static createBushGeometry(): THREE.BufferGeometry {
    if (this.cachedBushGeo) return this.cachedBushGeo;

    const folGeos: THREE.BufferGeometry[] = [];
    const spheres = [
      { x: 0, y: 0.95, z: 0, r: 1.25 },
      { x: -0.7, y: 0.8, z: 0.4, r: 0.95 },
      { x: 0.75, y: 0.75, z: -0.35, r: 1.0 },
      { x: 0.2, y: 0.7, z: 0.75, r: 0.85 },
    ];

    spheres.forEach((s) => {
      const geo = new THREE.DodecahedronGeometry(s.r, 1);
      geo.translate(s.x, s.y, s.z);
      folGeos.push(geo);
    });

    const merged = safeMergeBufferGeometries(folGeos);
    folGeos.forEach((g) => g.dispose());

    this.cachedBushGeo = merged || new THREE.DodecahedronGeometry(1.4, 1);
    return this.cachedBushGeo;
  }

  /**
   * Builds the entire forest of trees and bushes using high-efficiency InstancedMesh batches
   * partitioned into 4 spatial quadrants (NW, NE, SW, SE) to enable automatic native Three.js Frustum Culling.
   */
  public static buildVegetationForest(
    parentGroup: THREE.Group,
    trees: TreePlacementConfig[],
    materials: VegetationMaterials,
    staticObstacles?: any[]
  ): void {
    if (!trees || trees.length === 0) return;

    const dummy = new THREE.Object3D();

    const gridDim = 4;
    const cellSize = 440 / gridDim; // 110m cells from -220 to +220
    const getCellIndex = (x: number, z: number): number => {
      const cx = Math.max(0, Math.min(gridDim - 1, Math.floor((x + 220) / cellSize)));
      const cz = Math.max(0, Math.min(gridDim - 1, Math.floor((z + 220) / cellSize)));
      return cz * gridDim + cx;
    };

    const partition = (items: TreePlacementConfig[]) => {
      const cells: TreePlacementConfig[][] = Array.from({ length: gridDim * gridDim }, () => []);
      for (let i = 0; i < items.length; i++) {
        cells[getCellIndex(items[i].x, items[i].z)].push(items[i]);
      }
      return cells;
    };

    // 1. PINES (Partitioned in 16 localized spatial cells)
    const pineQuads = partition(trees.filter((t) => t.type === 'pine'));
    const { trunk: pTrunkGeo, foliage: pFolGeo } = this.createPineGeometries();

    pineQuads.forEach((quadItems) => {
      if (quadItems.length === 0) return;
      const count = quadItems.length;
      const pTrunkMesh = new THREE.InstancedMesh(pTrunkGeo, materials.trunkMat, count);
      const pFolMesh = new THREE.InstancedMesh(pFolGeo, materials.pineFoliageMat, count);

      pTrunkMesh.castShadow = false;
      pTrunkMesh.receiveShadow = false;
      pTrunkMesh.frustumCulled = true;
      pFolMesh.castShadow = false;
      pFolMesh.receiveShadow = false;
      pFolMesh.frustumCulled = true;

      quadItems.forEach((p, idx) => {
        dummy.position.set(p.x, 0, p.z);
        dummy.rotation.set(0, p.yaw, 0);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.updateMatrix();

        pTrunkMesh.setMatrixAt(idx, dummy.matrix);
        pFolMesh.setMatrixAt(idx, dummy.matrix);

        if (staticObstacles) {
          staticObstacles.push({
            x: p.x,
            z: p.z,
            radius: 0.9 * p.scale,
            type: 'tree',
          });
        }
      });

      pTrunkMesh.instanceMatrix.needsUpdate = true;
      pFolMesh.instanceMatrix.needsUpdate = true;
      pTrunkMesh.computeBoundingSphere();
      pTrunkMesh.computeBoundingBox();
      pFolMesh.computeBoundingSphere();
      pFolMesh.computeBoundingBox();
      parentGroup.add(pTrunkMesh);
      parentGroup.add(pFolMesh);
    });

    // 2. OAKS (Partitioned in 16 localized spatial cells)
    const oakQuads = partition(trees.filter((t) => t.type === 'oak'));
    const { trunk: oTrunkGeo, foliage: oFolGeo } = this.createOakGeometries();

    oakQuads.forEach((quadItems) => {
      if (quadItems.length === 0) return;
      const count = quadItems.length;
      const oTrunkMesh = new THREE.InstancedMesh(oTrunkGeo, materials.trunkMat, count);
      const oFolMesh = new THREE.InstancedMesh(oFolGeo, materials.oakFoliageMat, count);

      oTrunkMesh.castShadow = false;
      oTrunkMesh.receiveShadow = false;
      oTrunkMesh.frustumCulled = true;
      oFolMesh.castShadow = false;
      oFolMesh.receiveShadow = false;
      oFolMesh.frustumCulled = true;

      quadItems.forEach((o, idx) => {
        dummy.position.set(o.x, 0, o.z);
        dummy.rotation.set(0, o.yaw, 0);
        dummy.scale.set(o.scale, o.scale, o.scale);
        dummy.updateMatrix();

        oTrunkMesh.setMatrixAt(idx, dummy.matrix);
        oFolMesh.setMatrixAt(idx, dummy.matrix);

        if (staticObstacles) {
          staticObstacles.push({
            x: o.x,
            z: o.z,
            radius: 1.1 * o.scale,
            type: 'tree',
          });
        }
      });

      oTrunkMesh.instanceMatrix.needsUpdate = true;
      oFolMesh.instanceMatrix.needsUpdate = true;
      oTrunkMesh.computeBoundingSphere();
      oTrunkMesh.computeBoundingBox();
      oFolMesh.computeBoundingSphere();
      oFolMesh.computeBoundingBox();
      parentGroup.add(oTrunkMesh);
      parentGroup.add(oFolMesh);
    });

    // 3. CYPRESSES (Partitioned in 16 localized spatial cells)
    const cypressQuads = partition(trees.filter((t) => t.type === 'cypress'));
    const { trunk: cTrunkGeo, foliage: cFolGeo } = this.createCypressGeometries();

    cypressQuads.forEach((quadItems) => {
      if (quadItems.length === 0) return;
      const count = quadItems.length;
      const cTrunkMesh = new THREE.InstancedMesh(cTrunkGeo, materials.trunkMat, count);
      const cFolMesh = new THREE.InstancedMesh(cFolGeo, materials.cypressFoliageMat, count);

      cTrunkMesh.castShadow = false;
      cTrunkMesh.receiveShadow = false;
      cTrunkMesh.frustumCulled = true;
      cFolMesh.castShadow = false;
      cFolMesh.receiveShadow = false;
      cFolMesh.frustumCulled = true;

      quadItems.forEach((c, idx) => {
        dummy.position.set(c.x, 0, c.z);
        dummy.rotation.set(0, c.yaw, 0);
        dummy.scale.set(c.scale, c.scale, c.scale);
        dummy.updateMatrix();

        cTrunkMesh.setMatrixAt(idx, dummy.matrix);
        cFolMesh.setMatrixAt(idx, dummy.matrix);

        if (staticObstacles) {
          staticObstacles.push({
            x: c.x,
            z: c.z,
            radius: 0.6 * c.scale,
            type: 'tree',
          });
        }
      });

      cTrunkMesh.instanceMatrix.needsUpdate = true;
      cFolMesh.instanceMatrix.needsUpdate = true;
      cTrunkMesh.computeBoundingSphere();
      cTrunkMesh.computeBoundingBox();
      cFolMesh.computeBoundingSphere();
      cFolMesh.computeBoundingBox();
      parentGroup.add(cTrunkMesh);
      parentGroup.add(cFolMesh);
    });

    // 4. BUSHES (Partitioned in 16 localized spatial cells)
    const bushQuads = partition(trees.filter((t) => t.type === 'bush'));
    const bushGeo = this.createBushGeometry();

    bushQuads.forEach((quadItems) => {
      if (quadItems.length === 0) return;
      const count = quadItems.length;
      const bushMesh = new THREE.InstancedMesh(bushGeo, materials.bushMat, count);

      bushMesh.castShadow = false;
      bushMesh.receiveShadow = false;
      bushMesh.frustumCulled = true;

      quadItems.forEach((b, idx) => {
        dummy.position.set(b.x, 0, b.z);
        dummy.rotation.set(0, b.yaw, 0);
        dummy.scale.set(b.scale, b.scale, b.scale);
        dummy.updateMatrix();

        bushMesh.setMatrixAt(idx, dummy.matrix);
      });

      bushMesh.instanceMatrix.needsUpdate = true;
      bushMesh.computeBoundingSphere();
      bushMesh.computeBoundingBox();
      parentGroup.add(bushMesh);
    });
  }
}
