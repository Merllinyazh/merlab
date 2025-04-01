import React, { useState,useEffect  } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls,Text} from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import { Html } from "@react-three/drei";
import { useSpring, animated } from '@react-spring/three';
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";

// 🎯 Sidebar Beaker Component (Reagents)
const SidebarBeaker = ({ color, label, onClick }) => (
  <div style={{ textAlign: "center", margin: "5px", cursor: "pointer" }} onClick={() => onClick({ color, label })}>
    <Canvas style={{ width: "120px", height: "210px" }}>
      <ambientLight intensity={0.5} />
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 2, 32, 1, true]} />
        <meshPhysicalMaterial transparent opacity={0.4} roughness={0.1} />
      </mesh>
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 1.6, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </Canvas>
    <div style={{
      fontSize: "14px",
      fontWeight: "bold",
      marginTop: "5px",
      padding: "5px",
      backgroundColor: "#fff",
      borderRadius: "5px",
      boxShadow: "0px 2px 5px rgba(0,0,0,0.2)"
    }}>
      {label}
    </div>
  </div>
);



const TableBeaker = ({ color, label, position, onUpdatePosition, onNearBurette }) => {
  const [tilted, setTilted] = useState(false);
  const [pouring, setPouring] = useState(false);
  const [pourAmount, setPourAmount] = useState(0);
  const [autoPositioned, setAutoPositioned] = useState(false);

  // 🔄 Smooth tilting animation
  const [{ rotation }, apiRotation] = useSpring(() => ({
    rotation: [0, 0, 0],
    config: { mass: 1, tension: 180, friction: 20 },
  }));

  // 🏗️ Smooth movement animation
  const [{ pos }, api] = useSpring(() => ({
    pos: position,
    config: { mass: 1, tension: 120, friction: 14 },
  }));

  // 🎯 Auto-tilt when beaker is positioned correctly
  useEffect(() => {
    if (tilted) {
      apiRotation.start({ rotation: [ 0, 0,-Math.PI / 5.7] }); // 🔄 Tilt 30° (π/6 radians)
      startPouring();
    }
  }, [tilted]);

  // 🎯 Dragging function
  const bind = useDrag(({ offset: [x, y] }) => {
    if (autoPositioned) return; // Prevent dragging after auto-positioning

    const newX = x * 0.032;
    const newY = -y * 0.032;
    const newPos = [newX, newY, 0];

    api.start({ pos: newPos });
    onUpdatePosition(newPos);

    // ✅ Automatically position and tilt when near burette
    if (Math.abs(newX - 0.4) < 0.3 && Math.abs(newY - 1.5) < 0.4) {
      setAutoPositioned(true);
      api.start({ pos: [0.4, 1.5, 0] }); // 🔄 Snap to correct position
  
      setTimeout(() => {
        setTilted(true); // ✅ Trigger tilting
        setPouring(true);
        onNearBurette(color);
      }, 500); // Smooth transition before tilting
    } else {
      resetBeaker();
    }
  });

  // ✅ Function to smoothly tilt and pour
  const startPouring = () => {
    let pourTime = 0;
    const pourInterval = setInterval(() => {
      setPourAmount((prev) => {
        if (pourTime >= 6) {
          clearInterval(pourInterval);
          setTimeout(resetBeaker, 1000); // Reset after pouring completes
          return prev;
        }
        pourTime += 0.1;
        return prev + 0.1;
      });
    }, 100);
  };

  // 🔄 Function to reset the beaker
  const resetBeaker = () => {
    setTilted(false);
    setPouring(false);
    setPourAmount(0);
    setAutoPositioned(false);
    apiRotation.start({ rotation: [0, 0, 0] }); // Reset rotation
  };

  return (
    <animated.group position={pos} {...bind()} rotation={rotation}>
      {/* Beaker Container */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 1.5, 32, 1, true]} />
        <meshPhysicalMaterial transparent opacity={0.4} roughness={0.1} />
      </mesh>

      {/* Liquid inside the Beaker */}
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.2, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Label */}
      <Text position={[0, 1, 0]} fontSize={0.3} color="black">
        {label}
      </Text>

      {/* Pouring Liquid Effect */}
      {pouring && pourAmount > 0 && (
        <mesh position={[0.5,-1 +1.9 ,2]} rotation={[-Math.PI / 1.9, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.1, pourAmount-1 , 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} />
        </mesh>
      )}
    </animated.group>
  );
};





// 🎯 Static Table (Does NOT Rotate)
const StaticTable = () => (
  <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 6, 0, 0]}>
  <boxGeometry args={[10, 0.25, 1.5]} />
  <meshStandardMaterial color="brown" />
</mesh>
);

// 🎯 Burette Standrei";

const BuretteStand = () => {
  const { scene } = useGLTF("/burette_stand.glb"); // Load your GLB model

  return (
    <group position={[0, -1.4, 0]} rotation={[-Math.PI / 6, 0, 0]} scale={[7, 7, 7]}>
      <primitive object={scene} />
    </group>
  );
};


// 🎯 Burette
const Burette = ({ liquidColor, liquidHeight }) => {
  // Load the burette GLB model
  const { scene } = useGLTF("/burettel.glb");
  console.log("Burette Model:", scene); // Make sure the path is correct

  // Liquid animation
  const { animatedHeight } = useSpring({
    animatedHeight: liquidHeight,
    config: { tension: 80, friction: 20 },
  });

  return (
    <group>
      {/* Render the burette model */}
      <primitive object={scene} scale={[16, 16, 16]} position={[0, 0.5, 0]} />

      {/* Animated liquid inside the burette */}
      {liquidColor && (
        <animated.mesh position={[0, animatedHeight.to(h => -0.75 + h), 0]}>
          <cylinderGeometry args={[0.045, 0.045, 1.6, 32]} />
          <meshStandardMaterial color={liquidColor} opacity={0.8} transparent />
        </animated.mesh>
      )}
    </group>
  );
};


// 🎯 Draggable Conical Flask
const ConicalFlask = () => {
  const { scene } = useGLTF("/cf.glb"); // Load the GLB model
  const [fixed, setFixed] = useState(false);

  // ⚡ Smooth movement animation
  const [{ pos }, api] = useSpring(() => ({
    pos: [2.9, -0.8, 0], // Initial position
    config: { mass: 1, tension: 150, friction: 20 },
  }));

  // 🏗️ Dragging function
  const bind = useDrag(({ offset: [x, y] }) => {
    if (!fixed) {
      const newX = x * 0.016;
      const newY = -y * 0.016;
      api.start({ pos: [newX, newY, 0] });

      // ✅ Auto-position under burette
      if (Math.abs(newX - 0.4) < 0.2) {
        api.start({ pos: [0.2, -1.3, -0.2] });
        setFixed(true);
      }
    }
  });

  return (
    <animated.group
      position={pos.to((x, y, z) => [x, y, z])}
      // 🏗️ Bind animated position
      {...bind()}
      scale={[0.08, 0.08, 0.08]} // Adjust the scale if needed
    >
      <primitive object={scene} rotation={[Math.PI / 20, -Math.PI / 8, 0]}/>
    </animated.group>
  );
};

// 🔹 Rack Component (Holds all items)
const GlassRack = () => {
 

  // Function to toggle doors
  

  return (
    <group position={[2.7, 1.9, 0]}
    scale={[0.5, 0.5, 0.5]}
    rotation={[Math.PI / -80, Math.PI / -10, Math.PI / 90]} >
      {/* Cabinet Frame */}
      <mesh position={[1.5, 0.4, -0.5]}>
        <boxGeometry args={[4, 4, 1]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Glass Shelves */}
      {[1, 0, -1].map((y, i) => (
        <mesh key={i} position={[1.4, y, 0]}>
          <boxGeometry args={[2.8, 0.1, 0.9]} />
          <meshPhysicalMaterial
            color="lightblue"
            transparent
            opacity={0.5}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
      ))}

      
      
    </group>
  );
};
// 🔹 Pipette Component
const Pipette = ({ position }) => {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 1, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.2} color="white">
        Pipette
      </Text>
    </group>
  );
};

// 🔹 Test Tube Stack Component
const TestTubeStack = ({ position }) => {
  return (
    <group position={position}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[i * 0.2 - 0.4, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.7, 32]} />
          <meshStandardMaterial color="lightblue" transparent opacity={0.6} />
        </mesh>
      ))}
      <Text position={[0, -0.5, 0]} fontSize={0.2} color="white">
        Test Tubes
      </Text>
    </group>
  );
};

// 🔹 Glass Rod Component
const GlassRod = ({ position }) => {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 1, 32]} />
        <meshStandardMaterial color="white" transparent opacity={0.5} />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.2} color="white">
        Glass Rod
      </Text>
    </group>
  );
};

// 🔹 Rack Beaker Component (Smaller for Rack)
const RackBeaker = ({ position }) => {
  const scaleFactor = 0.1; // Smaller Beaker for Rack
  const points = [
    new THREE.Vector2(5.0 * scaleFactor, 0),
    new THREE.Vector2(4.8 * scaleFactor, 0.5 * scaleFactor),
    new THREE.Vector2(4.0 * scaleFactor, 3.0 * scaleFactor),
    new THREE.Vector2(3.5 * scaleFactor, 4.5 * scaleFactor),
    new THREE.Vector2(3.0 * scaleFactor, 5.5 * scaleFactor),
    new THREE.Vector2(2.2 * scaleFactor, 6.5 * scaleFactor),
    new THREE.Vector2(1.5 * scaleFactor, 7.5 * scaleFactor),
    new THREE.Vector2(1.5 * scaleFactor, 9.0 * scaleFactor),
    new THREE.Vector2(1.8 * scaleFactor, 9.2 * scaleFactor),
    new THREE.Vector2(2.0 * scaleFactor, 9.4 * scaleFactor),
  ];
  const flaskGeometry = new THREE.LatheGeometry(points, 120);

  return (
    <group position={position}>
      <mesh geometry={flaskGeometry}>
        <meshPhysicalMaterial
          color="lightgray"
          transparent
          opacity={0.6}
          roughness={0.04}
          metalness={0.1}
          transmission={1}
          clearcoat={2}
          reflectivity={0.9}
        />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.2} color="white">
        Rack Beaker
      </Text>
    </group>
  );
};

// 🎯 Main Experiment Layout
const ExperimentLayout = () => {
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [beakersOnTable, setBeakersOnTable] = useState([]);
  const [buretteLiquid, setBuretteLiquid] = useState(null);
  const [buretteFill, setBuretteFill] = useState(0); // % of burette fill

  // Handle Beaker Click (Add to Table)
  const handleBeakerClick = (beaker) => {
    setBeakersOnTable((prev) => {
      if (prev.some((b) => b.label === beaker.label)) return prev;

      const spacing = 1.5;
      const startX = -8;
      let newX = startX;

      const staticObjects = [
        { position: [0.4, -2.5, -0.2] }, // Conical Flask
        { position: [0, -1.4, 0] }, // Burette Stand
        { position: [0.4, 1.5, 0] } // Burette
      ];

      const allObjects = [...prev, ...staticObjects].map(obj => obj.position[0]);

      while (allObjects.some(x => Math.abs(x - newX) < spacing)) {
        newX += spacing;
      }

      return [...prev, { ...beaker, position: [newX, -2, -1.9] }];
    });
  };

  // 🎯 Handle Beaker Near Burette (Trigger Liquid Flow & Tilt)
  const handleNearBurette = (color) => {
    setBuretteLiquid(color);
    setBuretteFill(0);  
  
    let fillLevel = 0;
    const interval = setInterval(() => {
      fillLevel += 2;  // **More gradual increase**
      setBuretteFill(fillLevel);
      if (fillLevel >= 80) {
        clearInterval(interval);
      }
    }, 100);  // **Smoother updates every 100ms**
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      {/* Sidebar - Reagents */}
      <div style={{ width: "320px", height: "90vh", background: "#e0e0e0", padding: "10px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", overflowY: "auto" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "20px", color: "#333", textAlign: "center", textDecoration: "underline" }}>REAGENTS</h2>
        <SidebarBeaker color="purple" label="KMnO4" onClick={handleBeakerClick} />
        <SidebarBeaker color="green" label="FeSO4" onClick={handleBeakerClick} />
        <SidebarBeaker color="blue" label="H2SO4" onClick={handleBeakerClick} />
        <SidebarBeaker color="orange" label="Std FAS" onClick={handleBeakerClick} />
        <SidebarBeaker color="yellow" label="NaCl" onClick={handleBeakerClick} />
        <SidebarBeaker color="red" label="HCl" onClick={handleBeakerClick} />
        <SidebarBeaker color="cyan" label="Na2SO4" onClick={handleBeakerClick} />
        <SidebarBeaker color="brown" label="HNO3" onClick={handleBeakerClick} />
      </div>

      {/* Experiment Area */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Canvas camera={{ position: [0, 3, 7], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />

          {/* 🎯 Static Table */}
          <StaticTable />

          {/* 🎯 Experiment Objects */}
          <group rotation={rotationEnabled ? [0, 0, 0] : [0, 0, 0]}>
            <BuretteStand />
            <Burette liquidColor={buretteLiquid} liquidHeight={buretteFill} />
            <ConicalFlask />

            {/* Render Reagents (Beakers) on Table */}
            {beakersOnTable.map((beaker, index) => (
              <TableBeaker
                key={index}
                {...beaker}
                onUpdatePosition={(newPos) => {
                  let updatedBeakers = [...beakersOnTable];
                  updatedBeakers[index].position = newPos;
                  setBeakersOnTable(updatedBeakers);
                }}
                onNearBurette={handleNearBurette}
              />
            ))}
          </group>

          <GlassRack />

          <OrbitControls enablePan={false} enableZoom={true} enableRotate={rotationEnabled} />
        </Canvas>
      </div>

      {/* Right-side Buttons */}
      <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button onClick={() => setRotationEnabled(false)} style={{ padding: "10px", fontSize: "16px", cursor: "pointer", backgroundColor: "#ff5555", color: "white", border: "none", borderRadius: "5px" }}>
          Static
        </button>
        <button onClick={() => setRotationEnabled(true)} style={{ padding: "10px", fontSize: "16px", cursor: "pointer", backgroundColor: "#55ff55", color: "black", border: "none", borderRadius: "5px" }}>
          Rotate
        </button>
      </div>
    </div>
  );
};

export default ExperimentLayout;  