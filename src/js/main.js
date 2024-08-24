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
    this.btn = document.querySelector('.btn');

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.viewport.width, this.viewport.height);

    this.scene = new THREE.Scene();
    this.camera = null;
    this.mesh = null;

    this.loader = new THREE.TextureLoader();
    this.texture = null;

    this.controls = null;


    this.percentage = 0;

    this.speed = 0.0005;

    this.targetSpeed = 0.0005;
    this.currentSpeed = this.speed;
    this.speedIncrement = 0.00005;


    
    this._init();
    // this._update();
    // this._addEvent();
  }

  _loadTexture(url) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          // テクスチャの境界線の調整
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;

          resolve(texture);
        },
        undefined,
        (error) => {
          reject(error);
        }
      )
    })
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
      new THREE.Vector3( 38, 3, 38 ),
      new THREE.Vector3( 0, 6, 55 ),
      new THREE.Vector3( -38, 6, 38 ),
      new THREE.Vector3( -55, 3, 0 ),
      new THREE.Vector3( -40, 0, -40 ),
      new THREE.Vector3( 0, 0, -55 ),
      new THREE.Vector3( 40, -4, -40 ),
      new THREE.Vector3( 55, 0, 0 ),
    ]);
    // this.curveLine.curveType = 'catmullrom';
    // this.curveLine.curveType = 'chordal';
    this.curveLine.closed = true;
    this.curveLine.tension = 20.0;

    this.curveLineVivian = new VivianiCurve( 70 );
  }

  _addMesh() {
    // const geometry = new THREE.TubeGeometry(this.curveLineVivian, 100, 4, 10, false);
    const geometry = new THREE.TubeGeometry(this.curveLine, 200, 4, 36, false);
    const material = new THREE.MeshBasicMaterial({
      // color: 0x666666,
      // wireframe: true,
      side: THREE.BackSide,
      map: this.texture,
    });
    // material.map.wrapS = THREE.RepeatWrapping;
    // material.map.wrapT = THREE.RepeatWrapping;
    // material.map.repeat.set(12, 3);

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  async _init() {
    this.texture = await this._loadTexture('images/pattern1.jpg');

    this._setCamera();
    this._setControlls();
    this._setLight();
    this._setCurve();
    
    this._addMesh();
    this._update();
    this._addEvent();
  }

  _update() {
    // 徐々にスピードアップ
    if (this.currentSpeed < this.targetSpeed) {
      this.currentSpeed = Math.min(this.currentSpeed + this.speedIncrement, this.targetSpeed);
    } else if (this.currentSpeed > this.targetSpeed) {
      this.currentSpeed = Math.max(this.currentSpeed - this.speedIncrement, this.targetSpeed);
    }

    this.percentage += this.currentSpeed;

    // let p1 = this.curveLineVivian.getPoint(this.percentage%1);
    // let p2 = this.curveLineVivian.getPointAt((this.percentage + 0.01)%1);
    let p1 = this.curveLine.getPoint(this.percentage%1);
    let p2 = this.curveLine.getPointAt((this.percentage + 0.02)%1);

    this.camera.position.set(p1.x, p1.y, p1.z);
    this.camera.lookAt(p2);


    //レンダリング
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
    requestAnimationFrame(this._update.bind(this));
  }

  _onMouseDown() {
    this.targetSpeed = 0.009;
  }

  _onMouseUp() {
    this.targetSpeed = 0.0005;
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

    this.btn.addEventListener("mousedown", this._onMouseDown.bind(this));
    window.addEventListener("mouseup", this._onMouseUp.bind(this));
  }
}

new Main();



