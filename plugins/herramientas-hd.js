import FormData from "form-data";
import fetch from "node-fetch";
import Jimp from "jimp";
import fs from "fs";
import path from "path";

const handler = async (m, {conn, usedPrefix, command}) => {
  try {    
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || "";
    
    if (!mime) 
      return m.reply(`💙 Envie una imagen o responda a la imagen utilizando el comando: ${usedPrefix + command}`);
    
    if (!/image\/(jpe?g|png)/.test(mime)) 
      return m.reply(`💢 El formato del archivo (${mime}) no es compatible, envía o responde a una imagen`);
    
    m.reply('💙 Procesando imagen, mejorando la calidad...');
    
    
    let img = await q.download?.();
    if (!img) return m.reply("💙 No se pudo descargar la imagen");
    
    
    const tempDir = './miku/tmp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempInputPath = path.join(tempDir, `input_${Date.now()}.jpg`);
    fs.writeFileSync(tempInputPath, img);
    
    console.log(`✅ Imagen guardada en: ${tempInputPath}`);
    
    
    try {
      console.log("Intentando mejorar con Vyro API...");
      let pr = await remini(img, "enhance");
      
      
      const tempOutputPath = path.join(tempDir, `output_vyro_${Date.now()}.jpg`);
      fs.writeFileSync(tempOutputPath, pr);
      console.log(`✅ Imagen mejorada guardada en: ${tempOutputPath}`);
      
      
      await conn.sendMessage(m.chat, {
        image: pr,
        caption: '💙 Imagen mejorada con MIKU',
        mentions: [m.sender]
      }, { quoted: m });
      
      
      setTimeout(() => {
        try {
          fs.unlinkSync(tempInputPath);
          fs.unlinkSync(tempOutputPath);
        } catch (e) {
          console.log("Error al eliminar archivos temporales:", e);
        }
      }, 30000);
      
      return;
    } catch (vyroError) {
      console.error("Error con Vyro API:", vyroError);
      
      
      try {
        console.log("Intentando mejorar con Jimp...");
        const jimpImage = await Jimp.read(img);
        
      
        jimpImage
          .quality(100)
          .contrast(0.1) 
          .brightness(0.05) 
          .convolute([
            [-1, -1, -1],
            [-1, 9, -1],
            [-1, -1, -1]
          ]);
        
        
        const enhancedBuffer = await jimpImage.getBufferAsync(Jimp.MIME_JPEG);
        
       
        const tempJimpPath = path.join(tempDir, `output_jimp_${Date.now()}.jpg`);
        fs.writeFileSync(tempJimpPath, enhancedBuffer);
        console.log(`✅ Imagen mejorada con Jimp guardada en: ${tempJimpPath}`);
        
       
        await conn.sendMessage(m.chat, {
          image: enhancedBuffer,
          caption: '💙 Imagen mejorada (método alternativo)',
          mentions: [m.sender]
        }, { quoted: m });
        
        setTimeout(() => {
          try {
            fs.unlinkSync(tempInputPath);
            fs.unlinkSync(tempJimpPath);
          } catch (e) {
            console.log("Error al eliminar archivos temporales:", e);
          }
        }, 30000);
        
      } catch (jimpError) {
        console.error("Error con método Jimp:", jimpError);
        throw new Error("No se pudo mejorar la imagen con ningún método");
      }
    }
  } catch (error) {
    console.error("Error general:", error);
    return m.reply("💙 Ocurrió un error al procesar la imagen. Intente con otra imagen.");
  }
};

handler.help = ["remini", "hd", "enhance"];
handler.tags = ["ai", "tools"];
handler.register = true;
handler.command = ["remini", "hd", "enhance"];

export default handler;


async function remini(imageData, operation) {
  return new Promise(async (resolve, reject) => {
    try {
      const availableOperations = ["enhance", "recolor", "dehaze"];
      if (!availableOperations.includes(operation)) {
        operation = availableOperations[0];
      }
      
      const baseUrl = "https://inferenceengine.vyro.ai/" + operation + ".vyro";
      console.log(`📌 Usando URL: ${baseUrl}`);
      
      const formData = new FormData();
      formData.append("image", Buffer.from(imageData), {
        filename: "enhance_image_body.jpg", 
        contentType: "image/jpeg"
      });
      
      formData.append("model_version", 1, {
        "Content-Transfer-Encoding": "binary",
        contentType: "multipart/form-data; charset=utf-8"
      });
      
      
      const timeout = 60000;
      
      formData.submit(
        {
          url: baseUrl,
          host: "inferenceengine.vyro.ai",
          path: "/" + operation,
          protocol: "https:",
          timeout: timeout,
          headers: {
            "User-Agent": "okhttp/4.9.3",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip"
          }
        },
        function (err, res) {
          if (err) {
            console.error("Error en la solicitud:", err);
            reject(err);
            return;
          }
          
          if (res.statusCode !== 200) {
            console.error(`Error de API: Código ${res.statusCode}`);
            reject(new Error(`Error de API: Código ${res.statusCode}`));
            return;
          }
          
          const chunks = [];
          
          res.on("data", function (chunk) {
            chunks.push(chunk);
          });
          
          res.on("end", function () {
            if (chunks.length === 0) {
              reject(new Error("No se recibieron datos de la API"));
              return;
            }
            
            const buffer = Buffer.concat(chunks);
            if (buffer.length < 100) { 
              console.error("Respuesta sospechosamente pequeña:", buffer.toString());
              reject(new Error("Respuesta inválida de la API"));
              return;
            }
            
            resolve(buffer);
          });
          
          res.on("error", function (err) {
            console.error("Error en la respuesta:", err);
            reject(err);
          });
        }
      );
    } catch (error) {
      console.error("Error en remini():", error);
      reject(error);
    }
  });
}
