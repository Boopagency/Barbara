import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setCrf(14);
Config.setPixelFormat("yuv420p");
Config.setConcurrency(4);
// Ambientes sem o Chrome do Remotion: REMOTION_CHROME=/caminho/do/headless_shell
if (process.env.REMOTION_CHROME) Config.setBrowserExecutable(process.env.REMOTION_CHROME);
