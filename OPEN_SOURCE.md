# Open Source Licenses

- Defold License 1.0
  - [Defold](https://github.com/defold/defold/NOTICE)
- Apache 2.0
  - [mbedTLS](https://github.com/defold/defold/licenses/NOTICE-mbedtls) - Used when doing HTTPS requests or creating SSL sockets. Included in all builds of Defold.
  - [Basis Universal](https://github.com/defold/defold/licenses/NOTICE-basisuniversal) - Used when compressing textures.
  - [Remotery](https://github.com/defold/defold/licenses/NOTICE-remotery) - Used during development of your game. Not included in the release builds of Defold.
- MIT
  - [TypeScriptToLua](https://github.com/TypeScriptToLua/TypeScriptToLua/blob/master/LICENSE) - Tools used for compiling Lua.
  - [tsd-template](https://github.com/ts-defold/tsd-template/blob/master/LICENSE) - Tools used for compiling Lua.
  - [defold-xmath](https://github.com/thejustinwalsh/defold-xmath/blob/main/LICENSE) - Included in build.
  - [boom](https://github.com/britzl/boom) - Included in build.
  - [jctest](https://github.com/defold/defold/licenses/NOTICE-jctest) - Used when running unit tests in the engine. Not included in any builds.
  - [Lua](https://github.com/defold/defold/licenses/NOTICE-lua) - Used in HTML5 builds.
  - [LuaCJson](https://github.com/defold/defold/licenses/NOTICE-luacjson) - Used for encoding lua tables to JSON. Used on all platforms.
  - [LuaJIT](https://github.com/defold/defold/licenses/NOTICE-luajit) - Used on all platforms except HTML5.
  - [LuaSocket](https://github.com/defold/defold/licenses/NOTICE-luasocket) - Used for socket communication from Lua. Included on all platforms.
  - [microsoft_craziness.h](https://github.com/defold/defold/licenses/NOTICE-microsoft_craziness) - Used when running unit tests in the engine. Not included in any builds.
  - [XHR2](https://github.com/defold/defold/licenses/NOTICE-xhr2) - Used in HTML5 builds.
  - [xxtea-c](https://github.com/defold/defold/licenses/NOTICE-xxtea) - Used internally in the engine to obfuscate/encode Lua source code. Included in all builds of Defold.
  - [cgltf](https://github.com/defold/defold/licenses/NOTICE-cgltf) - Used when loading models in glTF format. Included in all builds.
  - [lipo](https://github.com/konoui/lipo) - Used when building bundles for macOS and iOS. Included in all Editor/bob.jar builds.
- Simplified BSD license (2-clause license)
  - [LZ4](https://github.com/defold/defold/licenses/NOTICE-lz4) - Used internally by the engine to read game archives. Included in all builds.
- BSD 2.0 license (3-clause license)
  - [vpx/vp8](https://github.com/defold/defold/licenses/NOTICE-vpx-vp8) - Used by the game play recorder. Only included in debug builds by default, but can be added [using an app manifest](https://defold.com/manuals/project-settings/#app-manifest).
  - [Tremolo](https://github.com/defold/defold/licenses/NOTICE-tremolo) - Used for decoding of Ogg sound files. Not used on Nintendo Switch, Win32 or HTML5. Included in all builds, but can be excluded [using an app manifest](https://defold.com/manuals/project-settings/#app-manifest)
  - [Sony Vector Math library](https://github.com/defold/defold/licenses/NOTICE-vecmath) - Used internally by the engine. Included in all builds.
- LGPL 2.0
  - [OpenAL](https://github.com/defold/defold/licenses/NOTICE-openal) - Used for sound playback on all platforms except Android. Can be excluded [using an app manifest](https://defold.com/manuals/project-settings/#app-manifest)