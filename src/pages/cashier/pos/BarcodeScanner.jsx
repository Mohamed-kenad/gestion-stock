import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Barcode, Camera, X } from 'lucide-react';
import { useToast } from "../../../hooks/use-toast";

const BarcodeScanner = ({ onBarcodeDetected, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const { toast } = useToast();

  // Start the camera and barcode scanning
  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setHasPermission(true);
        checkForBarcode();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      toast({
        title: "Erreur d'accès à la caméra",
        description: "Veuillez vérifier que vous avez autorisé l'accès à la caméra.",
        variant: "destructive",
      });
    }
  };

  // Stop the camera and barcode scanning
  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Function to check for barcodes in the video stream
  const checkForBarcode = () => {
    if (!isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    
    // Only process frames when video is playing
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      try {
        // This is where we would integrate a barcode scanning library
        // For this example, we'll simulate a barcode detection after a few seconds
        // In a real implementation, you would use a library like quagga.js or zxing
        
        // Simulate barcode detection (for demo purposes)
        if (!scanResult) {
          setTimeout(() => {
            // Generate a random barcode for demonstration
            const mockBarcode = Math.floor(Math.random() * 10000000000000).toString();
            setScanResult(mockBarcode);
            
            toast({
              title: "Code-barres détecté",
              description: `Code: ${mockBarcode}`,
            });
            
            if (onBarcodeDetected) {
              onBarcodeDetected(mockBarcode);
            }
            
            stopScanning();
          }, 3000);
        }
      } catch (error) {
        console.error('Error processing barcode:', error);
      }
    }
    
    // Continue checking for barcodes
    if (isScanning) {
      requestAnimationFrame(checkForBarcode);
    }
  };

  // Handle manual barcode entry
  const handleManualEntry = (e) => {
    e.preventDefault();
    const form = e.target;
    const barcode = form.barcode.value;
    
    if (barcode && barcode.trim() !== '') {
      setScanResult(barcode);
      
      if (onBarcodeDetected) {
        onBarcodeDetected(barcode);
      }
      
      form.reset();
    }
  };

  return (
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Scanner de code-barres</h3>
        </div>
        
        <div className="space-y-4">
          {!isScanning ? (
            <Button 
              className="w-full" 
              onClick={startScanning}
              disabled={hasPermission === false}
            >
              <Camera className="mr-2 h-4 w-4" />
              Activer la caméra
            </Button>
          ) : (
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={stopScanning}
            >
              <X className="mr-2 h-4 w-4" />
              Arrêter le scan
            </Button>
          )}
          
          {hasPermission === false && (
            <div className="text-center text-red-500 text-sm">
              L'accès à la caméra a été refusé. Veuillez vérifier les permissions de votre navigateur.
            </div>
          )}
          
          <div className="relative">
            <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
              <video 
                ref={videoRef}
                className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
                autoPlay
                playsInline
                muted
              />
              
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Barcode className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="text-center text-sm text-gray-500">
            {isScanning ? 'Placez le code-barres devant la caméra' : 'Cliquez sur le bouton pour activer la caméra'}
          </div>
          
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Ou entrez le code manuellement:</div>
            <form onSubmit={handleManualEntry} className="flex space-x-2">
              <input
                type="text"
                name="barcode"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Entrez le code-barres"
              />
              <Button type="submit">
                <Barcode className="mr-2 h-4 w-4" />
                Valider
              </Button>
            </form>
          </div>
          
          {scanResult && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="font-medium text-green-800">Code-barres détecté:</div>
              <div className="text-green-700">{scanResult}</div>
            </div>
          )}
        </div>
      </CardContent>
    
  );
};

export default BarcodeScanner;
