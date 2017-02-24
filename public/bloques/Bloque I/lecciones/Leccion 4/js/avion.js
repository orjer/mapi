var avion;

//Indica que se agregarán objetos de three.js a ArcGIS
require([
    "esri/views/3d/externalRenderers",
    "esri/geometry/SpatialReference"],
function(externalRenderers, SpatialReference) {
    avion = {
        renderer: null,     
        camera: null, //Camara de la escena      
        scene: null,  //Escena de three.js      
        ambient: null,      
        sun: null, //Iluminacion         
        iss: null, //Avion obj         
        issScale: 4000, //Escala inicial                                                   
        issMaterial: new THREE.MeshLambertMaterial({ color: 0xFFFF66 }), //Color del avión   
        cameraPositionInitialized: false,
        positionHistory: [], //Almacena posiciones del avion   
      
        //Funcion que se ejecutará al inicio
        setup: function(context) {
            //Crea la imagen
            this.renderer = new THREE.WebGLRenderer({
                context: context.gl,
                premultipliedAlpha: false
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(context.camera.fullWidth, context.camera.fullHeight);
            this.renderer.autoClearDepth = false;
            this.renderer.autoClearStencil = false;
            this.renderer.autoClearColor = false;
            //Crea la escena, camara, iluminación
            this.scene = new THREE.Scene();
            var cam = context.camera;
            this.camera = new THREE.PerspectiveCamera(cam.fovY, cam.aspect, cam.near, cam.far);
            this.ambient = new THREE.AmbientLight( 0xffffff, 0.5);
            this.scene.add(this.ambient);
            this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
            this.scene.add(this.sun);

            //Carga y crea el avión desde un archivo .obj
            var issMeshUrl = "obj/Plane.obj";
            var loader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
            loader.load(issMeshUrl, function(object3d) {
                console.log("ISS mesh loaded.");
                this.iss = object3d;
                this.iss.traverse( function ( child ) {
                    if ( child instanceof THREE.Mesh ) {
                        child.material = this.issMaterial;
                    }
                }.bind(this));

                this.iss.scale.set(this.issScale,this.issScale,this.issScale);
                this.scene.add(this.iss);
            }.bind(this), undefined, function(error) {
                console.error("Error loading ISS mesh. ", error);
            });
      
            //Posición inicial del avión en el mapa/view
            this.positionHistory.push({
                pos: [view.center.latitude, view.center.longitude, 400 * 1000]
            });

            context.resetWebGLState();
        },

        //Función que se ejecutará siempre (loop)    
        render: function(context) {
            var cam = context.camera;
            this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

            if (this.iss) {
                var transform = new THREE.Matrix4();
                var nose = 0;
                if(view.zoom > 12){
                    nose = 500;
                }else if(view.zoom > 8){
                    nose = 10000;
                }else if(view.zoom > 5){
                    nose = 300000;
                }else if(view.zoom > 0){
                    nose = 400000;
                }
                transform.fromArray(externalRenderers.renderCoordinateTransformAt(view, [
                view.center.longitude,view.center.latitude, nose], SpatialReference.WGS84, new Array(16)));
                
                //Cambia la escala del avión dependiendo del zoom
                if(view.zoom < 3){
                    this.iss.scale.set(2000,2000,2000);
                }else if(view.zoom < 4){
                    this.iss.scale.set(1000,1000,1000);
                }else if(view.zoom < 5){
                    this.iss.scale.set(500,500,500);
                }else if(view.zoom < 6){
                    this.iss.scale.set(250,250,250);
                }else if(view.zoom < 7){
                    this.iss.scale.set(100,100,100);
                }else if(view.zoom < 8){
                    this.iss.scale.set(50,50,50);
                }else if(view.zoom < 9){
                    this.iss.scale.set(40,40,40);                    
                }else if(view.zoom < 10){
                    this.iss.scale.set(20,20,20);                    
                }else if(view.zoom < 11){
                    this.iss.scale.set(10,10,10);                    
                }else if(view.zoom < 12){
                    this.iss.scale.set(5,5,5);                    
                }else if(view.zoom < 13){
                    this.iss.scale.set(1,1,1);                    
                }else if(view.zoom < 14){
                    this.iss.scale.set(1,1,1);                    
                }else if(view.zoom < 15){
                    this.iss.scale.set(0.5,0.5,0.5);                    
                }else if(view.zoom < 16){
                    this.iss.scale.set(0.2,0.2,0.2);                    
                }
                
                this.iss.position.set(transform.elements[12], transform.elements[13], transform.elements[14]);
                
                if (this.positionHistory.length > 0 &&  !this.cameraPositionInitialized) {
                    this.cameraPositionInitialized = true;
                    view.goTo({
                        target: [view.center.longitude, view.center.latitude]
                    });
                }
            }

            //Cambia la iluminación
            var l = context.sunLight;
            this.sun.position.set(
                l.direction[0],
                l.direction[1],
                l.direction[2]
            );
            this.sun.intensity = l.diffuse.intensity;
            this.sun.color = new THREE.Color(l.diffuse.color[0], l.diffuse.color[1], l.diffuse.color[2]);
            this.ambient.intensity = l.ambient.intensity;
            this.ambient.color = new THREE.Color(l.ambient.color[0], l.ambient.color[1], l.ambient.color[2]);

            this.renderer.resetGLState();
            this.renderer.render(this.scene, this.camera);

            externalRenderers.requestRender(view);
            context.resetWebGLState();
        }
    }
});