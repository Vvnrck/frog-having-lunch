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

    app.raycaster = new THREE.Raycaster()
    app.raycaster.params.Points.threshold = 0.4
    app.mousePos = new THREE.Vector2()
    app.renderer.domElement.addEventListener(
        'mousemove', onDocumentMouseMove, false
    );
    app.renderer.domElement.addEventListener(
        'mouseup', onDocumentMouseClick, false
    );
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
        window.app.objects.frog = object
        window.app.scene.add(object)
    });

    // tongue
    var geometry = new THREE.ConeGeometry( 0.2, 0.1, 4 )
    var material = new THREE.MeshPhongMaterial({
        color: 0xaa4444,
        shininess: 100,
        shading: THREE.FlatShading
    })
    var cone = new THREE.Mesh( geometry, material )
    cone.position.x = 3.8
    cone.position.y = 3.8
    cone.position.z = 1.8
    cone.rotation.z -= 3.8;

    console.log(cone)

    window.app.objects.frogTongue = {
        body: cone,
        direction: [0, 0, 0]
    }
    window.app.scene.add(cone)
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
            map: THREE.ImageUtils.loadTexture( 'skybox2.jpg' )
        }));
        else materialArray.push({})
	    materialArray[i].side = THREE.BackSide;
    }
	var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyboxGeom = new THREE.BoxBufferGeometry(100000, 100000, 100000, 1,
                                                 1, 1, null, true)
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
    var raycastSphere = new THREE.SphereGeometry(1, 16, 8);
    light1 = new THREE.PointLight(0xccdfff, 0.8, 50, 2);
    light1.add( new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
        color: 0xccdfff
    })))
    window.app.scene.add(light1)

    window.app.objects.wisp = {
        raycastSphere: raycastSphere,
        raycastMesh: new THREE.Mesh(raycastSphere, new THREE.MeshBasicMaterial({
            opacity: 0,
            transparent: true
        })),
        body: light1,
        direction: 0,
        step: 0,
        intersected: false,
        possibleStatuses: {
            arriving: { steps: 120 },
            flyingAround: { steps: 60 },
            goingToBeEaten: { steps: 10 },
            beingEaten: { steps: 10 },
            eaten: { steps: 120 }
        },
        currentStatus: 'arriving',
        hoverControlsLux: true,
        hovered: false
    }
    window.app.scene.add(window.app.objects.wisp.raycastMesh)

}

function _rand(from, to) {
    return Math.random() * (to - from) + from
}

function render() {
    stepToNextAnimation = -1
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
    var wispAnimLen = objs.wisp.possibleStatuses[objs.wisp.currentStatus].steps
    switch (objs.wisp.currentStatus) {
        case 'arriving':
            if (!objs.wisp.step) {
                objs.wisp.hoverControlsLux = true
                objs.wisp.body.intensity = 1
                objs.wisp.body.position.x = -50
                objs.wisp.body.position.y = -50
                objs.wisp.body.position.z = 5
                objs.wisp.direction = [
                    (objs.wisp.body.position.x - 0) / wispAnimLen,
                    (objs.wisp.body.position.y - 0) / wispAnimLen,
                    (objs.wisp.body.position.z - 2) / wispAnimLen,
                ]

            }
            if (objs.wisp.step == wispAnimLen) {
                objs.wisp.currentStatus = 'flyingAround'
                objs.wisp.step = stepToNextAnimation
            }
            break

        case 'flyingAround':
            if (!objs.wisp.step) {
                objs.wisp.direction = [
                    (objs.wisp.body.position.x - _rand(0, -5)) / wispAnimLen,
                    (objs.wisp.body.position.y - _rand(0, -5)) / wispAnimLen,
                    (objs.wisp.body.position.z - _rand(1, 5)) / wispAnimLen,
                ]
            }
            if (objs.wisp.step == wispAnimLen) {
                objs.wisp.step = stepToNextAnimation
            }
            break

        case 'goingToBeEaten':
            if (!objs.wisp.step) {
                objs.wisp.direction = [0, 0, 0]
                objs.wisp.hoverControlsLux = false
                objs.wisp.body.intensity = 2
            }
            if (objs.wisp.step == wispAnimLen) {
                objs.wisp.currentStatus = 'beingEaten'
                objs.wisp.step = stepToNextAnimation
            }
            break

        case 'beingEaten':
            if (!objs.wisp.step) {
                objs.wisp.direction = [
                    (objs.wisp.body.position.x - objs.frog.position.x) / wispAnimLen,
                    (objs.wisp.body.position.y - objs.frog.position.y) / wispAnimLen,
                    (objs.wisp.body.position.z - objs.frog.position.z) / wispAnimLen,
                ]
            }
            if (objs.wisp.step == wispAnimLen) {
                objs.wisp.currentStatus = 'eaten'
                objs.wisp.step = stepToNextAnimation
                objs.wisp.body.intensity = 0
            }
            break

        case 'eaten':
            if (!objs.wisp.step) {
                objs.wisp.direction = [0, 0, 0]
            }
            if (objs.wisp.step == wispAnimLen) {
                objs.wisp.currentStatus = 'arriving'
                objs.wisp.step = stepToNextAnimation
            }
            break
    }


    // tongue
    
    if (objs.wisp.currentStatus == 'goingToBeEaten') {
        var tonguePos = objs.frogTongue.body.geometry.vertices[1]
        var globalTonguePos = objs.frogTongue.body.localToWorld(tonguePos)

        if (objs.wisp.step == stepToNextAnimation) {

            var animLen = objs.wisp.possibleStatuses.goingToBeEaten.steps + 1
            objs.frogTongue.direction = [
                (globalTonguePos.x - objs.wisp.body.position.x) / animLen,
                (globalTonguePos.y - objs.wisp.body.position.y) / animLen,
                (globalTonguePos.z - objs.wisp.body.position.z) / animLen,
            ]
        }

        // change the pos
        globalTonguePos.x -= objs.frogTongue.direction[0]
        globalTonguePos.y -= objs.frogTongue.direction[1]
        globalTonguePos.z -= objs.frogTongue.direction[2]
        tonguePos = objs.frogTongue.body.worldToLocal(globalTonguePos)
        objs.frogTongue.body.geometry.verticesNeedUpdate = true

        var dist = [
            globalTonguePos.x - objs.wisp.body.position.x,
            globalTonguePos.y - objs.wisp.body.position.y,
            globalTonguePos.z - objs.wisp.body.position.z,
        ]
        console.log(Math.sqrt(
            Math.pow(dist[0], 2)
            +Math.pow(dist[1], 2)
            +Math.pow(dist[2], 2)
        ))
    }
    else if (objs.wisp.currentStatus == 'beingEaten') {
        // clone position from the wisp
        objs.frogTongue.body.geometry.vertices[1].x = objs.wisp.body.position.x
        objs.frogTongue.body.geometry.vertices[1].y = objs.wisp.body.position.y
        objs.frogTongue.body.geometry.vertices[1].z = objs.wisp.body.position.z
        objs.frogTongue.body.worldToLocal(
            objs.frogTongue.body.geometry.vertices[1]
        )
        objs.frogTongue.body.geometry.verticesNeedUpdate = true
    }
    else {
        objs.frogTongue.body.geometry.vertices[1].x = 0
        objs.frogTongue.body.geometry.vertices[1].y = 0
        objs.frogTongue.body.geometry.vertices[1].z = 0
        objs.frogTongue.body.geometry.verticesNeedUpdate = true
    }


    objs.wisp.body.position.x -= objs.wisp.direction[0]
    objs.wisp.body.position.y -= objs.wisp.direction[1]
    objs.wisp.body.position.z -= objs.wisp.direction[2]
    objs.wisp.raycastMesh.position.x = objs.wisp.body.position.x
    objs.wisp.raycastMesh.position.y = objs.wisp.body.position.y
    objs.wisp.raycastMesh.position.z = objs.wisp.body.position.z
    objs.wisp.step++
    

    // Move tongue:
    // > app.objects.frogTongue.geometry.vertices[1].y = 4
    // > app.objects.frogTongue.geometry.vertices[1].x = 0
    // > app.objects.frogTongue.geometry.verticesNeedUpdate = true



    app.frame++;
    app.renderer.render(app.scene, app.camera)
}


function onDocumentMouseMove(event) {
    event.preventDefault();
    app.mousePos.x = ( event.clientX / window.innerWidth ) * 2 - 1
    app.mousePos.y = - ( event.clientY / window.innerHeight ) * 2 + 1
    app.raycaster.setFromCamera( app.mousePos, app.camera )

    var intersections = app.raycaster.intersectObject(
        window.app.objects.wisp.raycastMesh, true
    );
    if ( intersections.length > 0 ) {
        if (window.app.objects.wisp.hoverControlsLux) {
            window.app.objects.wisp.body.intensity = 1.4
        }
        window.app.objects.wisp.hovered = true
        document.body.style.cursor = 'pointer';
    } else {
        if (window.app.objects.wisp.hoverControlsLux) {
            window.app.objects.wisp.body.intensity = 1
        }
        window.app.objects.wisp.hovered = false
        document.body.style.cursor = 'auto';
    }
}

function onDocumentMouseClick(event) {
    event.preventDefault();
    if (window.app.objects.wisp.hovered) {
        window.app.objects.wisp.currentStatus = 'goingToBeEaten'
        window.app.objects.wisp.step = stepToNextAnimation
    }
}
