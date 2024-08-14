// import '../css/style.scss';
import { radian } from './utils';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { VivianiCurve } from "three/examples/jsm/curves/CurveExtras.js"


class Main {
  constructor() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.canvas = document.querySelector("#canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.viewport.width, this.viewport.height);

    this.scene = new THREE.Scene();
    this.camera = null;
    this.mesh = null;

    this.controls = null;


    this.percentage = 0;

    
    this._init();
    this._update();
    this._addEvent();
  }

  _setCamera() {
    // this.camera = new THREE.PerspectiveCamera(45, this.viewport.width / this.viewport.height, 1, 100);
    // this.camera.position.set(0, 0, 5);
    // this.scene.add(this.camera);

    //ウインドウとWebGL座標を一致させる
    const fov = 45;
    const fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
    const distance = (this.viewport.height / 2) / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
    this.camera = new THREE.PerspectiveCamera(fov, this.viewport.width / this.viewport.height, 1, distance * 2);
    this.camera.position.z = distance;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
  }

  _setControlls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
  }

  _setLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(1, 1, 1);
    this.scene.add(light);
  }

  _setCurve() {
    this.curveLine = new THREE.CatmullRomCurve3([
      // new THREE.Vector3( 0, - 40, - 40 ),
      // new THREE.Vector3( 0, 40, - 40 ),
      // new THREE.Vector3( 0, 100, - 40 ),
      // new THREE.Vector3( 0, 40, 40 ),
      // new THREE.Vector3( 0, - 40, 40 )
      new THREE.Vector3( 40, 20, 40 ),
      new THREE.Vector3( -40, 0, 40 ),
      // new THREE.Vector3( -30, -10, 30 ),
      new THREE.Vector3( -50, 0, -50 ),
      new THREE.Vector3( 50, 0, -50 ),
    ]);
    this.curveLine.curveType = 'catmullrom';
    this.curveLine.curveType = 'chordal';
    this.curveLine.closed = true;
    this.curveLine.tension = 20.0;

    this.curveLineVivian = new VivianiCurve( 70 );
  }

  _addMesh() {
    // const geometry = new THREE.TubeGeometry(this.curveLineVivian, 100, 4, 10, false);
    const geometry = new THREE.TubeGeometry(this.curveLine, 100, 4, 10, false);
    const material = new THREE.MeshStandardMaterial({color: 0x444444, wireframe: true });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  _init() {
    this._setCamera();
    this._setControlls();
    this._setLight();
    this._setCurve();
    this._addMesh();
  }

  _update() {
    this.percentage += 0.001;

    // let p1 = this.curveLineVivian.getPoint(this.percentage%1);
    // let p2 = this.curveLineVivian.getPointAt((this.percentage + 0.01)%1);
    let p1 = this.curveLine.getPoint(this.percentage%1);
    let p2 = this.curveLine.getPointAt((this.percentage + 0.03)%1);

    this.camera.position.set(p1.x, p1.y, p1.z);
    this.camera.lookAt(p2);


    //レンダリング
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
    requestAnimationFrame(this._update.bind(this));
  }

  _onResize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    // レンダラーのサイズを修正
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    // カメラのアスペクト比を修正
    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();
  }

  _addEvent() {
    window.addEventListener("resize", this._onResize.bind(this));
  }
}

new Main();



