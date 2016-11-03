initApp()
initWaves()
initSkybox()
initFrog()
initIsland()
initKamish()
initWisp()
initWall()
render()

function _receive_cast_shadow(object) {
    _receive_shadow(object)
    _cast_shadow(object)
}

function _receive_shadow(object) {
    if (object.receiveShadow === undefined) {
        console.log(["can't receive shadow", object])
    }
    object.receiveShadow = true
}

function _cast_shadow(object) {
    if (object.castShadow === undefined) {
        console.log(["can't cast shadow", object])
    }
    object.castShadow = true
}


function initApp() {
    window.app = window.app || {
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(
            50, window.innerWidth / window.innerHeight, 0.001, 300000
        ),
        renderer: new THREE.WebGLRenderer({antialias: true}),
        objects: {},
        frame: 0,
        fixedCam: true
    }

    app.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(app.renderer.domElement)
    app.renderer.shadowMapEnabled = true
    // app.renderer.shadowMapType = THREE.PCFSoftShadowMap;


	
	var light = new THREE.AmbientLight( 0x404040, 0.5 ); // soft white light
    window.app.scene.add( light );
    
    var spotLight = new THREE.SpotLight( 0x404040, 0.8 );
    spotLight.position.set( -15, 10, 10 );
    // _cast_shadow(spotLight)
    window.app.scene.add( spotLight );

    var directionalLight2 = new THREE.DirectionalLight( 0x404040, 0.5 );
    directionalLight2.position.set( 10, 10, 10 );
    directionalLight2.castShadow = false;
    directionalLight2.shadowCameraVisible = false
    window.app.scene.add( directionalLight2 );
	
    if (!app.fixedCam) {
        app.orbitControl = new THREE.OrbitControls(
            app.camera, app.renderer.domElement
        )   
        app.orbitControl.update()    
    }
    
    app.camera.position.set(0, -15, 5);
    app.camera.lookAt(new THREE.Vector3(
        0, 100, 0
    ))

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
	loader.load( 'lambert_telefrog.json', function ( object ) {
		object.position.x = 4;
		object.position.y = 4;
		object.position.z = 1.5;
        object.rotation.y -= 3.8;
        object.rotation.x += 3.14/2;
        _cast_shadow(object)
        window.app.objects.frog = object
        window.app.scene.add(object)
    });

    // tongue
    var geometry = new THREE.ConeGeometry( 0.1, 0.1, 6 )
    var material = new THREE.MeshPhongMaterial({
        color: 0xaa4444,
        shininess: 100,
        shading: THREE.FlatShading
    })
    var cone = new THREE.Mesh( geometry, material )
    cone.position.x = 3.8
    cone.position.y = 3.6
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
        _receive_shadow(object)
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
        yVerticeNum: 20,
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
                _receive_shadow(polygon)
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
        if (i == 2)
        materialArray.push(new THREE.MeshBasicMaterial( { 
            map: THREE.ImageUtils.loadTexture( 'skybox3.jpg' )
        }));
        else materialArray.push({})
	    materialArray[i].side = THREE.BackSide;
    }
	var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyboxGeom = new THREE.BoxBufferGeometry(120000, 110000, 120000, 1,
                                                 1, 1, null, true)
	var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
    window.app.objects.skybox = skybox
	window.app.scene.add( skybox );
}

function _rand_point(r1, r2, m1, s1, m2, s2) {
    var x, y, xc1 = 0, xc2 = 0.5, yc1 = 0, yc2 = 0.5;
    var complete = false;

    while(!complete) {
        x = Math.random();
        y = Math.random();
       
        var top_circle_in = (
            Math.pow((y - yc2), 2) + Math.pow((x - xc2), 2)
        ) <= Math.pow(r2, 2);
        var bottom_circle_out = (
            Math.pow((y - yc1), 2) + Math.pow((x - xc1), 2)
        ) >= Math.pow(r1, 2);
        if(top_circle_in && bottom_circle_out) complete = true;
    }
    return [x*m1 + s1, y*m2 + s2];
}

function initKamish() {
    // load all kamishes
    var kamishes = []
    var loader = new THREE.ObjectLoader();
    loader.load( 'kamish1_cr.json', function ( object ) { 
        _receive_cast_shadow(object)
        kamishes.push(object) 
        loader.load( 'kamish2_cr.json', function ( object ) { 
            _receive_cast_shadow(object)
            kamishes.push(object) 
            loader.load( 'kamish3_cr.json', function ( object ) { 
                _receive_cast_shadow(object)
                kamishes.push(object) 
                for (var i = 0; i < 30; i++)
                    window.app.scene.add(getKamish(1, 1, 20, -10, 20, -5))
                for (var i = 0; i < 3; i++)
                    window.app.scene.add(getKamish(1, 1, 4, -8, 4, 4))

            })
        })

    })


    function getKamish(r1, r2, m1, s1, m2, s2) {
        var index = parseInt(Math.random() * 10) % 3
        var kamish = kamishes[index].clone()
        kamish.scale.set(3, 3 + (Math.random()), 3)
        kamish.rotation.x += 3.14/2
        kamish.rotation.y += 3.14 * Math.random()
        kamish.position.z = 0.6 * Math.random()
        var pos = _rand_point(r1, r2, m1, s1, m2, s2)
        kamish.position.x = pos[0]
        kamish.position.y = pos[1]
        return kamish
    }
}

function initWisp() {
    var sphere = new THREE.SphereGeometry(0.1, 16, 8);
    var raycastSphere = new THREE.SphereGeometry(0.5, 16, 8);
    light1 = new THREE.PointLight(0xccdfff, 0.8, 50, 3);
    light1.add( new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
        color: 0xccdfff
    })))
    _cast_shadow(light1)
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
            flyingAround: { steps: 120 },
            goingToBeEaten: { steps: 5 },
            beingEaten: { steps: 15 },
            eaten: { steps: 1200 }
        },
        currentStatus: 'arriving',
        hoverControlsLux: true,
        hovered: false
    }
    window.app.scene.add(window.app.objects.wisp.raycastMesh)

}

function initWall() {
    var loader = new THREE.ObjectLoader();
    loader.load( 'wall.json', function ( object ) {
        _receive_shadow(object)
        object.scale.set(1.5, 1.5, 1.5)
        var object2 = object.clone()
        var object3 = object.clone()

        object.position.x = -10;
        object.position.y = 6;
        object.position.z = 0.1;
        object.rotation.y -= 0.45;
        object.rotation.x += 3.14/2;
        window.app.scene.add(object)

        object2.position.x = 13;
        object2.position.y = 8;
        object2.position.z = 0.1;
        object2.rotation.y += 3*3.14/2 - 0.45;
        object2.rotation.x += 3.14/2;
        window.app.scene.add(object2)

        object3.scale.set(1.5, 2, 1.5)
        object3.position.z = -1.5;
        object3.position.y = 28;
        object3.rotation.y += 3*3.14/2;
        object3.rotation.x += 3.14/2;
        window.app.scene.add(object3)


    })
}

function _rand(from, to) {
    return Math.random() * (to - from) + from
}

function render() {
    stepToNextAnimation = -1
    objs = app.objects

    requestAnimationFrame(render)

    if (!window.app.fixedCam)
        window.app.orbitControl.update()

    window.app.objects.skybox.rotation.y += 0.001

    // waves
    for (x = 1; x < objs.waves.xVerticeNum; x++) {
        for (y = 1; y < objs.waves.yVerticeNum; y++) {
            geom = objs.waves.vertices[x][y].plane.geometry;
            for (i = 0; i < 5; i++) {
                geom.vertices[i].z = 
                    0.5 * Math.sin(geom.vertices[i].x / 2 + app.frame / 120) 
                    + 0.3 * Math.sin(geom.vertices[i].y / 2 + app.frame / 120)
                    + 0.05 * Math.sin(geom.vertices[i].x + geom.vertices[i].y + app.frame / 12)
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
                objs.wisp.body.position.x = -20
                objs.wisp.body.position.y = -20
                objs.wisp.body.position.z = 5
                objs.wisp.direction = [
                    (objs.wisp.body.position.x + 2) / wispAnimLen,
                    (objs.wisp.body.position.y + 2) / wispAnimLen,
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
                objs.wisp.body.intensity = 2.5
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
    var tv = 3
    if (objs.wisp.currentStatus == 'goingToBeEaten') {
        var tonguePos = objs.frogTongue.body.geometry.vertices[tv]
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
        objs.frogTongue.body.geometry.vertices[tv].x = objs.wisp.body.position.x
        objs.frogTongue.body.geometry.vertices[tv].y = objs.wisp.body.position.y
        objs.frogTongue.body.geometry.vertices[tv].z = objs.wisp.body.position.z
        objs.frogTongue.body.worldToLocal(
            objs.frogTongue.body.geometry.vertices[tv]
        )
        objs.frogTongue.body.geometry.verticesNeedUpdate = true
    }
    else {
        objs.frogTongue.body.geometry.vertices[tv].x = 0
        objs.frogTongue.body.geometry.vertices[tv].y = 0
        objs.frogTongue.body.geometry.vertices[tv].z = 0
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
            window.app.objects.wisp.body.intensity = 0.8
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
