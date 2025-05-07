import * as THREE from "./build/three.module.js";

export class Pingpong {
  constructor(gameContainer) {
    const divContainer = gameContainer;
    this._divContainer = divContainer;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    divContainer.appendChild(renderer.domElement);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    this._scene = scene;

    this._setupCamera();
    this._setupLight();
    this._setupModel();

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(() => this.render());
  }

  _setupCamera() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;

    const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 10000);
    camera.position.z = 500;
    this._camera = camera;
  }

  _setupLight() {
    const color = 0xffffff;

    const light = new THREE.DirectionalLight(color, 1);
    const light1 = new THREE.AmbientLight(color, 0.7);
    light.position.set(-100, 200, 400);
    this._scene.add(light);
    this._scene.add(light1);
  }

  _setupModel() {
    const geometry_plane = new THREE.PlaneGeometry(this._divContainer.clientWidth, this._divContainer.clientHeight);

    const material_plane = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry_plane, material_plane);

    this._scene.add(plane);
    this._plane = plane;
    plane.translateZ(-500);

    const geometry_ball = new THREE.SphereGeometry(20);
    const material_ball = new THREE.MeshPhongMaterial({ color: 0x272520 });
    const ball = new THREE.Mesh(geometry_ball, material_ball);

    this._scene.add(ball);
    this._ball = ball;
    ball.translateX(0);

    const geometry_bar = new THREE.BoxGeometry(20, 200, 20);
    const material_bar = new THREE.MeshPhongMaterial({ color: 0x272520 });
    const bar0 = new THREE.Mesh(geometry_bar, material_bar);
    const bar1 = new THREE.Mesh(geometry_bar, material_bar);

    this._scene.add(bar0);
    this._bar0 = bar0;
    this._bar0.translateX(this._divContainer.clientWidth / -2 + 10);

    this._scene.add(bar1);
    this._bar1 = bar1;
    this._bar1.translateX(this._divContainer.clientWidth / 2 - 10);
  }

  resize() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;

    this._camera.left = width / -2;
    this._camera.right = width / 2;
    this._camera.top = height / 2;
    this._camera.bottom = height / -2;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(width, height);
  }

  render(objectsPosition) {
    if (objectsPosition) {
      this._ball.position.set(objectsPosition.ball_x, objectsPosition.ball_y, 0);
      this._bar0.position.set(objectsPosition.bar0_x, objectsPosition.bar0_y, 0);
      this._bar1.position.set(objectsPosition.bar1_x, objectsPosition.bar1_y, 0);
    }

    this._renderer.render(this._scene, this._camera);
  }
}
