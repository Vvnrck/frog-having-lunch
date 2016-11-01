initApp()
initWaves()
initSkybox()
initFrog()
initIsland()
// initKamish()
initWisp()
render()


function initApp() {
    window.app = window.app || {
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(
            50, window.innerWidth / window.innerHeight, 0.001, 300000
        ),
        renderer: new THREE.WebGLRenderer({antialias: true}),
        objects: {},
        frame: 0
    }

    app.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(app.renderer.domElement)

	
	var light = new THREE.AmbientLight( 0x404040, 1 ); // soft white light
    window.app.scene.add( light );
    
    var directionalLight1 = new THREE.DirectionalLight( 0x404040, 1 );
    directionalLight1.position.set( 10, -10, 10 );
    window.app.scene.add( directionalLight1 );

    var directionalLight1 = new THREE.DirectionalLight( 0x404040, 0.5 );
    directionalLight1.position.set( 10, 10, 10 );
    window.app.scene.add( directionalLight1 );
	
    app.orbitControl = new THREE.OrbitControls(
        app.camera, app.renderer.domElement
    )
    
    app.camera.position.set(0, 0, 10);
    // app.camera.lookAt(new THREE.Vector3( 0, 6, 0 ))
    app.camera.lookAt(new THREE.Vector3(
        -1.83742, -10.5427, 4.8626 
    ))
    app.orbitControl.update()
    return window.app
}

function initFrog() {
	window.app = window.app || initApp()
	
	var loader = new THREE.ObjectLoader();
	loader.load( 'telefrog.json', function ( object ) {
		object.position.x = 4;
		object.position.y = 4;
		object.position.z = 1.5;
        object.rotation.y -= 3.8;
        object.rotation.x += 3.14/2;
        window.app.scene.add(object)
    });
}

function initIsland() {
    window.app = window.app || initApp()
    var loader = new THREE.ObjectLoader();
    loader.load( 'island.json', function ( object ) {
        object.position.x = 4;
        object.position.y = 4;
        object.position.z = 0.5;
        object.scale.set(2, 2, 2)
        object.rotation.y += 3*3.14/2;
        object.rotation.x += 3.14/2;
        window.app.scene.add(object)
    }); 
}

function initWaves() {
    window.app = window.app || initApp()

    // Create WAVES
    var waves = {
        xVerticeNum: 50,
        yVerticeNum: 17,
        verticeOffset: 2,
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

                var material = new THREE.MeshPhongMaterial({
                    color: 0x114B6A,
                    shininess: 100,
                    shading: THREE.FlatShading
                })
                
                var material2 = new THREE.MeshStandardMaterial({
                    color: 0x114B6A,
                    roughness: 0.1,
                    metalness: 1.0,
                    shading: THREE.FlatShading
                })
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

function initSkybox() {
    window.app = window.app || initApp()

    var materialArray = [];
	for (var i = 0; i < 6; i++) {
        if (true || i == 2)
        materialArray.push(new THREE.MeshBasicMaterial( { 
            map: THREE.ImageUtils.loadTexture( 'skybox.jpg' ) 
        }));
        else materialArray.push({})
	    materialArray[i].side = THREE.BackSide;
    }
	var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyboxGeom = new THREE.BoxBufferGeometry( 100000, 100000, 100000, 1, 1, 1, null, true);
	var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
	window.app.scene.add( skybox );
}

function initKamish() {
    // load all kamishes
    var kamishes = []
    var loader = new THREE.ObjectLoader();
    loader.load( 'kamish1.json', function ( object ) { kamishes.push(object) })
    loader.load( 'kamish2.json', function ( object ) { kamishes.push(object) })
    loader.load( 'kamish3.json', function ( object ) { 
        kamishes.push(object) 
        window.app.scene.add(getKamish())
    })

    function getKamish() {
        var index = parseInt(Math.random() * 10) % 3
        var kamish = kamishes[index].clone()
        kamish.scale.set(3, 4, 3)
        // kamish.rotation.y += 3*3.14/2
        kamish.rotation.x += 3.14/2
        kamish.rotation.y += 3.14 * Math.random()
        kamish.position.z = 0.6
        return kamish
    }
    
}

function initWisp() {
    var sphere = new THREE.SphereGeometry(0.1, 16, 8);
    light1 = new THREE.PointLight(0xccdfff, 0.8, 50, 2);
    light1.add( new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
        color: 0xccdfff
    })))
    window.app.scene.add(light1)
    window.app.objects.wisp = {
        body: light1,
        direction: 0,
        step: 60
    }
}

function _rand(from, to) {
    return Math.random() * (to - from) + from
}

function render() {
    objs = app.objects

    requestAnimationFrame(render)

    window.app.orbitControl.update()

    // waves
    for (x = 1; x < objs.waves.xVerticeNum; x++) {
        for (y = 1; y < objs.waves.yVerticeNum; y++) {
            geom = objs.waves.vertices[x][y].plane.geometry;
            for (i = 0; i < 5; i++) {
                geom.vertices[i].z = 
                    0.5 * Math.sin(geom.vertices[i].x / 2 + app.frame / 60.0) 
                    + 0.3 * Math.sin(geom.vertices[i].y / 2 + app.frame / 60.0)
            }          
            geom.verticesNeedUpdate = true
        }
    }

    // wisp
    if (objs.wisp.step == 60) {
        objs.wisp.direction = [
            (objs.wisp.body.position.x - _rand(0, -5)) / 60.0,
            (objs.wisp.body.position.y - _rand(0, -5)) / 60.0,
            (objs.wisp.body.position.z - _rand(1, 5)) / 60.0,
        ]
        objs.wisp.step = 0
    }
    objs.wisp.body.position.x -= objs.wisp.direction[0]
    objs.wisp.body.position.y -= objs.wisp.direction[1]
    objs.wisp.body.position.z -= objs.wisp.direction[2]
    objs.wisp.step++

    app.frame++;
    app.renderer.render(app.scene, app.camera)
}
