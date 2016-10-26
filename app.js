initApp()
initWaves()
initSphere()
render()
initFrog()


function initApp() {
    window.app = window.app || {
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.001, 1000
        ),
        renderer: new THREE.WebGLRenderer({precision: 'lowp'}),
        objects: {},
        frame: 0
    }

    app.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(app.renderer.domElement)
    app.camera.position.z = 23
    app.camera.lookAt(new THREE.Vector3( 0, 6, 0 ))
    return window.app
}

function initFrog() {
	window.app = window.app || initApp()
	
	var loader = new THREE.JSONLoader();
	loader.load( 'Frog.json', function ( geometry, materials ) {
        var gpu_geom = new THREE.BufferGeometry().fromGeometry(geometry)
        gpu_geom.computeBoundingBox()
        gpu_geom.normalizeNormals ()
	    var mesh = new THREE.Mesh( gpu_geom, new THREE.MeshFaceMaterial( materials ) );

		mesh.position.x =0;
		mesh.position.y =5;
		mesh.position.z =5;
		mesh.rotateY(-90);
    	//mesh.scale.set(.2, .2, .2)
    	window.app.scene.add( mesh );
    	
    	console.log(gpu_geom);

    }); 
}

function initWaves() {
    window.app = window.app || initApp()

    // Create WAVES
    var waves = {
        xVerticeNum: 50,
        yVerticeNum: 25,
        verticeOffset: 1.5,
        vertices: [] 
    }
    for (var x = 0; x < waves.xVerticeNum; x++) {
        waves.vertices[x] = []
        for (var y = 0; y < waves.yVerticeNum; y++) {
            var coordX = x * waves.verticeOffset - waves.xVerticeNum * waves.verticeOffset / 2
            var coordY = y * waves.verticeOffset - waves.yVerticeNum * waves.verticeOffset / 2
            var coordZ = 0

            waves.vertices[x][y] = {
                x: coordX,
                y: coordY,
                z: coordZ
            }

            if (x > 0 && y > 0) {
                var rectShape = new THREE.Geometry();
                rectShape.vertices.push(
                    new THREE.Vector3(waves.vertices[x-1][y-1].x, waves.vertices[x-1][y-1].y, 0),
                    new THREE.Vector3(waves.vertices[x][y-1].x, waves.vertices[x][y-1].y, 0),
                    new THREE.Vector3(waves.vertices[x][y].x, waves.vertices[x][y].y, 0),
                    new THREE.Vector3(waves.vertices[x-1][y].x, waves.vertices[x-1][y].y, 0),
                    new THREE.Vector3(waves.vertices[x-1][y-1].x, waves.vertices[x-1][y-1].y, 0)
                )
                rectShape.faces.push(new THREE.Face3(0, 1, 2))
                rectShape.faces.push(new THREE.Face3(2, 3, 4))
                rectShape.computeFaceNormals();

                var material = new THREE.MeshNormalMaterial();
                var polygon = new THREE.Mesh(rectShape, material)
                waves.vertices[x][y].plane = {
                    geometry: rectShape,
                    polygon: polygon
                }
                app.scene.add(polygon)
            }
        }
    }
    app.objects.waves = waves
}

function initSphere() {
    window.app = window.app || initApp()

    var geometry = new THREE.IcosahedronGeometry(1, 1);
    var material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true
    });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.add(new THREE.Vector3(0, 5, 5))

    window.app.scene.add(sphere);
    window.app.objects.sphere = {
        geometry: geometry,
        mesh: sphere
    }
}


function render() {
    var objs = app.objects

    requestAnimationFrame(render)

    objs.sphere.mesh.rotation.x += 0.01
    objs.sphere.mesh.rotation.y += 0.01

    for (var x = 1; x < objs.waves.xVerticeNum; x++) {
        for (var y = 1; y < objs.waves.yVerticeNum; y++) {
            var geom = objs.waves.vertices[x][y].plane.geometry;

            for (var i = 0; i < 5; i++) {
                geom.vertices[i].z = 
                    0.5 * Math.sin(geom.vertices[i].x / 2 + app.frame / 60.0) 
                    + 0.3 * Math.sin(geom.vertices[i].y / 2 + app.frame / 60.0)
            }
            
            geom.verticesNeedUpdate = true
            geom.computeFaceNormals()
            geom.computeVertexNormals()
        }
    }

    app.frame++;
    app.renderer.render(app.scene, app.camera)
}
