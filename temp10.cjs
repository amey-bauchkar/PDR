import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/data/products.json');
const raw = fs.readFileSync(file, 'utf8');
const products = JSON.parse(raw);

const atten = products.find(p => p.slug === 'attenuator');
if (atten) {
    atten.category = "Test & Measuring Equipment";
    atten.description = "Digital variable fiber attenuator with up to 60 dB attenuation range";
    atten.tagline = "Digital variable fiber attenuator with up to 60 dB attenuation range";
    atten.title = "Variable Fiber Attenuator - OVA Series | PDR World";
    
    atten.features = [
        "Attenuation range up to 60 dB (SM)",
        "Calibrated wavelengths: 1310 nm / 1490 nm / 1550 nm",
        "Digital attenuating mode"
    ];
    
    atten.applications = [
        "Test and Measurement",
        "Optical Link Simulation",
        "Fiber Optic Lab Use"
    ];
    
    atten.specs = [
        { label: "Attenuation Range", value: "40 dB / 60 dB" },
        { label: "Calibrated Wavelengths", value: "1310 nm / 1490 nm / 1550 nm" },
        { label: "Fiber Mode", value: "SM" },
        { label: "Attenuating Mode", value: "Digital" }
    ];
    
    fs.writeFileSync(file, JSON.stringify(products, null, 2) + '\n', 'utf8');
    console.log("Updated attenuator product successfully.");
} else {
    console.log("Product not found!");
}
