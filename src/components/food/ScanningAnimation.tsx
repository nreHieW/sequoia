import { motion } from "framer-motion";

const ScanningAnimation = () => (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 rounded-lg" />
  
      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-lg"
        style={{
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)",
        }}
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{
          duration: 1.5,
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
  
      {/* Scanning text */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <motion.div
          className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-blue-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
  
export default ScanningAnimation;