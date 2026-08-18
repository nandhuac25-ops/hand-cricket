import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";

export interface GameHandle { scene: Scene; dispose: () => void; }

/** Floodlight Folklore atmosphere behind the accessible HTML match interface. */
export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.014, 0.029, 0.065, 1);
  const camera = new ArcRotateCamera("arena-camera", Math.PI / 2, Math.PI / 2.28, 13, Vector3.Zero(), scene);
  camera.attachControl(canvas, false); camera.lowerRadiusLimit = 13; camera.upperRadiusLimit = 13;
  const light = new HemisphericLight("floodlight", new Vector3(0, 1, 0), scene);
  light.intensity = 0.55; light.diffuse = new Color3(0.82, 0.96, 0.52);
  const rings = [-3.9, 0, 3.9].map((x, index) => {
    const ring = MeshBuilder.CreateTorus(`signal-ring-${index}`, { diameter: index === 1 ? 6.8 : 4.2, thickness: 0.022, tessellation: 72 }, scene);
    ring.position = new Vector3(x, index === 1 ? 0.5 : -0.7, 2.8 - index * 0.55); ring.rotation.x = Math.PI / 2.28;
    const material = new StandardMaterial(`signal-mat-${index}`, scene);
    material.emissiveColor = index === 1 ? new Color3(0.48, 0.73, 0.18) : new Color3(0.18, 0.25, 0.36); material.alpha = index === 1 ? 0.21 : 0.15; ring.material = material;
    return ring;
  });
  const observer = scene.onBeforeRenderObservable.add(() => rings.forEach((ring, index) => { ring.rotation.z += 0.0005 * (index + 1); ring.position.y = (index === 1 ? 0.5 : -0.7) + Math.sin(performance.now() * 0.00012 + index) * 0.16; }));
  return { scene, dispose: () => { scene.onBeforeRenderObservable.remove(observer); scene.dispose(); } };
}

