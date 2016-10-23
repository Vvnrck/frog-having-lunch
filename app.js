function initApp() {
    window.app = window.app || {
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        ),
        renderer: new THREE.WebGLRenderer(),
        objects: {},
        frame: 0
    }

    app.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(app.renderer.domElement)
    app.camera.position.z = 5
    app.camera.lookAt(new THREE.Vector3( 0, 4, 0 ))
    return window.app
}


function initObjects() {
    window.app = window.app || initApp()

    // Create CUBE
    window.app.objects.cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshNormalMaterial()
    )
    // app.scene.add(app.objects.cube)


    // Create WAVES
    var waves = {
        xVerticeNum: 30,
        yVerticeNum: 30,
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


function render() {
    var objs = app.objects

    requestAnimationFrame(render)

    objs.cube.rotation.x += 0.01
    objs.cube.rotation.y += 0.01

    for (var x = 1; x < objs.waves.xVerticeNum; x++) {
        for (var y = 1; y < objs.waves.yVerticeNum; y++) {
            var geom = objs.waves.vertices[x][y].plane.geometry;

            for (var i = 0; i < 5; i++) {
                geom.vertices[i].z = 
                    0.5 * Math.sin(geom.vertices[i].x + app.frame / 60.0) 
                    + 0.5 * Math.sin(geom.vertices[i].y + app.frame / 60.0)
            }
            
            geom.verticesNeedUpdate = true
            geom.computeFaceNormals()
            geom.computeVertexNormals()
        }
    }

    app.frame++;
    app.renderer.render(app.scene, app.camera)
}
initApp()
initObjects()
render()