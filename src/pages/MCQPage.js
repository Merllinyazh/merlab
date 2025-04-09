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
  <div style={{ textAlign: "center", margin: "0px", cursor: "pointer" ,padding:"0.1px"}} onClick={() => onClick({ color, label })}>
    <Canvas style={{ width: "90px", height: "200px" }}>
      <ambientLight intensity={0.5} />
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 2, 32, 1, true]} />
        <meshPhysicalMaterial transparent opacity={0.4} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 1.6, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </Canvas>
    <div style={{
      fontSize: "14px",
      fontWeight: "bold",
      marginTop: "0.1px",
      padding: "-0.1px",
      backgroundColor: "#fff",
      borderRadius: "4px",
      boxShadow: "0px 2px 5px rgba(0,0,0,0.2)"
    }}>
      {label}
    </div>
  </div>
);



const TableBeaker = ({ color, label, position, onUpdatePosition, onNearBurette, onPourUpdate }) => {
  const [tilted, setTilted] = useState(false);
  const [pouring, setPouring] = useState(false);
  const [pourHeight, setPourHeight] = useState(0.1);
  const [autoPositioned, setAutoPositioned] = useState(false);

  const [{ rotation }, apiRotation] = useSpring(() => ({
    rotation: [-Math.PI / 8, 0, Math.PI / 200],
    config: { mass: 1, tension: 180, friction: 20 },
  }));

  const [{ pos }, api] = useSpring(() => ({
    pos: position,
    config: { mass: 1, tension: 120, friction: 14 },
  }));

  useEffect(() => {
    if (tilted) {
      apiRotation.start({ rotation: [0, 0, -Math.PI / 4] });
      startPouring();
    }
  }, [tilted]);

  const bind = useDrag(({ offset: [x, y] }) => {
    if (autoPositioned) return;

    const newX = x * 0.032;
    const newY = -y * 0.032;
    const newPos = [newX, newY, 0];

    api.start({ pos: newPos });
    onUpdatePosition(newPos);

    if (Math.abs(newX - 0.4) < 0.3 && Math.abs(newY - 1.5) < 0.4) {
      setAutoPositioned(true);
      api.start({ pos: [-0.6, 2.6, 0] });

      setTimeout(() => {
        setTilted(true);
        setPouring(true);
        onNearBurette(color);
      }, 500);
    } else {
      resetBeaker();
    }
  });

  // ✅ Function to smoothly increase pouring height & update Burette
  const startPouring = () => {
    let pourTime = 0;
    const pourInterval = setInterval(() => {
      setPourHeight((prev) => {
        if (pourTime >= 5) {
          clearInterval(pourInterval);
          setTimeout(resetBeaker, 1500);
          return prev;
        }
        pourTime += 0.3;
        onPourUpdate(0.02); // Send small volume increments
        return prev + 0.00001;
      });
    }, 100);
  };

  const getPourPath = (height) => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 0, 0),
      new THREE.Vector3(0.3, -height / 14, 0.4),
      new THREE.Vector3(0.6, -height, 0.1),
    ]);
  };

  const resetBeaker = () => {
    setTilted(false);
    setPouring(false);
    setPourHeight(0.1);
    setAutoPositioned(false);
    apiRotation.start({ rotation: [0, 0, 0] });
  };

  return (
    <animated.group position={pos} {...bind()} rotation={rotation} scale={[0.5, 0.5, 0.5]}>
      {/* Beaker Container */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 1.5, 32, 1, true]} />
        <meshPhysicalMaterial transparent opacity={0.4} roughness={0.1} />
      </mesh>

      {/* Liquid inside the Beaker */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.0, 30]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Label */}
      <Text position={[0, 1, 0]} fontSize={0.3} color="black">
        {label}
      </Text>

      {/* Pouring Liquid Effect */}
      {pouring && pourHeight > 0 && (
        <mesh position={[0.4, -1 + 1.7, 2]}>
          <tubeGeometry args={[getPourPath(pourHeight), 27, 0.12, 17, false]} />
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
const Burette = ({ liquidColor = "black", pouredVolume }) => {
  const { scene } = useGLTF("/burettel.glb");
  const [liquidHeight, setLiquidHeight] = useState(0); // start from 0
  const [color, setColor] = useState(liquidColor);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.opacity = 0.3;
        child.material.depthWrite = true;
      }
    });
  }, [scene]);

  // update height on pour
  useEffect(() => {
    if (pouredVolume > 0) {
      setLiquidHeight((prev) => Math.min(prev + pouredVolume, 1.2));
    }
  }, [pouredVolume]);

  useEffect(() => {
    if (liquidColor) setColor(liquidColor);
  }, [liquidColor]);

  // react-spring animation
  const { height } = useSpring({
    height: liquidHeight,
    config: { tension: 120, friction: 18 },
  });

  return (
    <group>
      {/* Static model */}
      <primitive object={scene} scale={[28, 19, 16]} position={[0, 0.2, -1.1]} />

      {/* Liquid shown only after pouring */}
      {liquidHeight > 0 && (
        <group position={[0, 0.25, -1.1]}>
          <animated.mesh
            scale={height.to((h) => [1, h, 1])}
            position={height.to((h) => [0, h / 2, 0])}
          >
            <cylinderGeometry args={[0.1, 0.1, 1, 32]} />
            <animated.meshStandardMaterial
              color={color}
              transparent
              opacity={height.to((h) => (h > 0.01 ? 0.8 : 0))}
            />
          </animated.mesh>
        </group>
      )}
    </group>
  );
};




// 🎯 Draggable Conical Flask
const ConicalFlask = () => {
  const { scene } = useGLTF("/cf.glb"); // Load the GLB model
  const [fixed, setFixed] = useState(false);

  // 🔹 Adjustable Initial & Fixed Positions and Angles
  const INITIAL_POSITION = [-4.3, 2.08, 0.2]; // Change manually
  const INITIAL_ROTATION = [0, -Math.PI / 2, 0.2]; // Change manually

  const FIXED_POSITION = [0, -1.08, -0.2]; // Change manually
  const FIXED_ROTATION = [0, 0, 0]; // Change manually

  // ⚡ Smooth movement animation
  const [{ pos, rot }, api] = useSpring(() => ({
    pos: INITIAL_POSITION,
    rot: INITIAL_ROTATION,
    config: { mass: 1, tension: 150, friction: 20 },
  }));

  // Change material color
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: "white", // Change color
          transparent: true,
          opacity: 0.4, // Adjust transparency
          roughness: 0.2,
          metalness: 0.1,
        });
      }
    });
  }, [scene]);

  // 🏗️ Dragging function
  const bind = useDrag(({ offset: [x, y] }) => {
    if (!fixed) {
      const newX = x * 0.016;
      const newY = -y * 0.016;
      api.start({ pos: [newX, newY, 0] });

      // ✅ Auto-position & adjust angle when near the burette
      if (Math.abs(newX - 0.4) < 0.2) {
        api.start({ pos: FIXED_POSITION, rot: FIXED_ROTATION });
        setFixed(true);
      }
    }
  });

  return (
    <animated.group
      position={pos.to((x, y, z) => [x, y, z])}
      rotation={rot.to((x, y, z) => [x, y, z])}
      {...bind()} // 🏗️ Bind animated position
      scale={[0.25, 0.25, 0.25]}
    >
      <primitive object={scene} />
    </animated.group>
  );
};



// 🔹 Rack Component (Holds all items)
const GlassRack = () => {
  const { scene } = useGLTF('/display_rack.glb'); // Path to your .glb model

  return (
    <primitive
      object={scene}
      position={[-2.4, -2.9, 0]}  // Position of the Glass Rack
      scale={[0.5, 1.4,1.2 ]}      // Scale the model if needed
      rotation={[-0.3,1.8,-0.1]}  // Optional: Adjust rotation if necessary
    />
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
    setBuretteLiquid(color); // Set the color of the burette liquid
    setBuretteFill(0);  // Reset fill
  
    let fillLevel = 0;
    const interval = setInterval(() => {
      fillLevel += 2;  // **More gradual increase**
      setBuretteFill(fillLevel);
      if (fillLevel >= 80) {
        clearInterval(interval);
      }
    }, 100);  // **Smoother updates every 100ms**
  };

  const [pouredVolume, setPouredVolume] = useState(0.5);

  

const handlePourUpdate = (volume) => {
  setPouredVolume((prev) => prev + volume);
};
  
  return (
    <div style={{ display: "flex", flexDirection: "row", height: "90vh" }}>
      {/* Sidebar - Reagents */}
      <div style={{ width: "240px", height: "90vh", background: "#e0e0e0", padding: "1px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", overflowY: "auto" }}>
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
            <Burette liquidColor={buretteLiquid} pouredVolume={pouredVolume} />
            <ConicalFlask />

            {/* Render Reagents (Beakers) on Table */}
            {beakersOnTable.map((beaker, index) => (
              <TableBeaker
              key={index}
              {...beaker}
              position={[-3.9 + index * 1.0, -0.6, 0]}
              onUpdatePosition={(newPos) => {
                let updatedBeakers = [...beakersOnTable];
                updatedBeakers[index].position = newPos;
                setBeakersOnTable(updatedBeakers);
              }}
              onNearBurette={handleNearBurette}
              onPourUpdate={handlePourUpdate}
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