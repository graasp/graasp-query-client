# Changelog

## [0.3.1](https://github.com/graasp/graasp-query-client/compare/v0.3.0...v0.3.1) (2023-03-09)


### Bug Fixes

* add `currentMemberId` back to `signOut` mutation ([#245](https://github.com/graasp/graasp-query-client/issues/245)) ([852e6e7](https://github.com/graasp/graasp-query-client/commit/852e6e7bb29f9e7b2c386c2efe38c7c82da545bd))
* allow item to be undefined in `useEtherpad` ([852e6e7](https://github.com/graasp/graasp-query-client/commit/852e6e7bb29f9e7b2c386c2efe38c7c82da545bd))
* allow optional properties ([#250](https://github.com/graasp/graasp-query-client/issues/250)) ([493d9e2](https://github.com/graasp/graasp-query-client/commit/493d9e2b0bc0480bd7e5ed38d0d0c8813f7504c9))
* catch avatar not found error ([#248](https://github.com/graasp/graasp-query-client/issues/248)) ([d7d8e97](https://github.com/graasp/graasp-query-client/commit/d7d8e971fafaf16bfd2be301251dc40c3c27890b))
* post and patch item chat message body type ([852e6e7](https://github.com/graasp/graasp-query-client/commit/852e6e7bb29f9e7b2c386c2efe38c7c82da545bd))
* return type of mutations ([852e6e7](https://github.com/graasp/graasp-query-client/commit/852e6e7bb29f9e7b2c386c2efe38c7c82da545bd))
* **types:** narrow type to only the required API_HOST from QueryConfig in apps ([493d9e2](https://github.com/graasp/graasp-query-client/commit/493d9e2b0bc0480bd7e5ed38d0d0c8813f7504c9))
* typing of isDataEqual with generics ([852e6e7](https://github.com/graasp/graasp-query-client/commit/852e6e7bb29f9e7b2c386c2efe38c7c82da545bd))
* use ThumbnailSize from sdk ([#252](https://github.com/graasp/graasp-query-client/issues/252)) ([58941fe](https://github.com/graasp/graasp-query-client/commit/58941fe6d577bfd0cb8f3ca660b1107f0fde0ec9))


### Documentation

* fix repo link in package ([852e6e7](https://github.com/graasp/graasp-query-client/commit/852e6e7bb29f9e7b2c386c2efe38c7c82da545bd))

## [0.3.0](https://github.com/graasp/graasp-query-client/compare/v0.2.1...v0.3.0) (2023-02-21)


### Features

* export mutations ([#242](https://github.com/graasp/graasp-query-client/issues/242)) ([a1fa06b](https://github.com/graasp/graasp-query-client/commit/a1fa06bbde96aa73f5b4a6af6b418cd479c7a25f))

## [0.2.1](https://github.com/graasp/graasp-query-client/compare/v0.2.0...v0.2.1) (2023-02-18)


### Bug Fixes

* remove wrong hook return types ([#240](https://github.com/graasp/graasp-query-client/issues/240)) ([924fb19](https://github.com/graasp/graasp-query-client/commit/924fb19c3472b6cc5e408cd0c23c08ad12ca9f38))

## [0.2.0](https://github.com/graasp/graasp-query-client/compare/v0.1.5...v0.2.0) (2023-02-16)


### Features

* add `useExportItemChat` hook ([c9be56d](https://github.com/graasp/graasp-query-client/commit/c9be56d1cff0cfc96cb7bd9adeefc17033396a5c))
* move types to `@graasp/sdk/frontend` ([#203](https://github.com/graasp/graasp-query-client/issues/203)) ([c9be56d](https://github.com/graasp/graasp-query-client/commit/c9be56d1cff0cfc96cb7bd9adeefc17033396a5c))


### Bug Fixes

* deprecate exported types, use types from sdk instead ([c9be56d](https://github.com/graasp/graasp-query-client/commit/c9be56d1cff0cfc96cb7bd9adeefc17033396a5c))
* **types:** `useEtherpad` type ([c9be56d](https://github.com/graasp/graasp-query-client/commit/c9be56d1cff0cfc96cb7bd9adeefc17033396a5c))
* **types:** `useItemThumbnail` hook return type ([c9be56d](https://github.com/graasp/graasp-query-client/commit/c9be56d1cff0cfc96cb7bd9adeefc17033396a5c))
* **types:** improve `useItem` query return type ([c9be56d](https://github.com/graasp/graasp-query-client/commit/c9be56d1cff0cfc96cb7bd9adeefc17033396a5c))
* **types:** in infinite query ([c9be56d](https://github.com/graasp/graasp-query-client/commit/c9be56d1cff0cfc96cb7bd9adeefc17033396a5c))

## [0.1.5](https://github.com/graasp/graasp-query-client/compare/v0.1.4...v0.1.5) (2023-02-09)


### Bug Fixes

* add types to invitation hooks ([#236](https://github.com/graasp/graasp-query-client/issues/236)) ([723e817](https://github.com/graasp/graasp-query-client/commit/723e817c24bb70bb630125bad9487ef4f1f99c2f))

## [0.1.4](https://github.com/graasp/graasp-query-client/compare/v0.1.3...v0.1.4) (2023-02-06)


### Bug Fixes

* complete action type ([ebdf47f](https://github.com/graasp/graasp-query-client/commit/ebdf47ff2f1472dae8b440b62db7f2b4ad5f70a9))

## [0.1.3](https://github.com/graasp/graasp-query-client/compare/v0.1.2...v0.1.3) (2023-01-30)


### Bug Fixes

* return null if item is not defined in useEtherpad ([#230](https://github.com/graasp/graasp-query-client/issues/230)) ([1a170bf](https://github.com/graasp/graasp-query-client/commit/1a170bf816259e4f828be77259ae443d94a31ef7))

## [0.1.2](https://github.com/graasp/graasp-query-client/compare/v0.1.1...v0.1.2) (2023-01-23)


### Bug Fixes

* fix item tag and item category types ([81f39b9](https://github.com/graasp/graasp-query-client/commit/81f39b9c631a9f25b893adff7e7b31da0b686b2f))

## [0.1.1](https://github.com/graasp/graasp-query-client/compare/v0.1.0...v0.1.1) (2023-01-20)


### Bug Fixes

* get parents can return partial result ([#225](https://github.com/graasp/graasp-query-client/issues/225)) ([c476a04](https://github.com/graasp/graasp-query-client/commit/c476a04fb22dbe5b78a83da02100e3a242953728))

## 0.1.0 (2023-01-10)


### ⚠ BREAKING CHANGES

* get public items by tag hook, get public member, export api, use only named export

### Features

* add copy public item mutation ([93a109d](https://github.com/graasp/graasp-query-client/commit/93a109d9f42959b14ae629b47386a8ad455e4575))
* add cryptoJS message id and itemChat hook typing ([#137](https://github.com/graasp/graasp-query-client/issues/137)) ([f8cff60](https://github.com/graasp/graasp-query-client/commit/f8cff606c3169e5553dc9aa18c5795210a481944))
* add etherpad queries ([#220](https://github.com/graasp/graasp-query-client/issues/220)) ([dee26d0](https://github.com/graasp/graasp-query-client/commit/dee26d0fd0a4bd932514d59c6aa0a6d2b30d30eb))
* add get items by ids ([a898f29](https://github.com/graasp/graasp-query-client/commit/a898f299cde11f12e4171806fd6c9e22bc7e7973))
* add get member by id ([228cd3c](https://github.com/graasp/graasp-query-client/commit/228cd3c06dcd7877f4c08e8aeae17c7703066896))
* add h5p routes and routine ([#168](https://github.com/graasp/graasp-query-client/issues/168)) ([962897f](https://github.com/graasp/graasp-query-client/commit/962897fcf0770461f45f633c8c7917965f36c989))
* add hook for download & item like ([ce86263](https://github.com/graasp/graasp-query-client/commit/ce862638ccb2a08fb44c92bb5c0f7e3798c3a853))
* add hook for getting multiple members by id ([41e5784](https://github.com/graasp/graasp-query-client/commit/41e5784294a754b2bec8d65be8951a1fd3b17756))
* add hook to retrieve apps list ([ec57a8a](https://github.com/graasp/graasp-query-client/commit/ec57a8a34dbb24f35aea3f78c86ed581481893e7))
* add hooks & mutations & tests for validation ([260a1b3](https://github.com/graasp/graasp-query-client/commit/260a1b304779bf8a3f68451f7ccf91a3fa4f767a))
* add hooks after refactor backend ([cf359fd](https://github.com/graasp/graasp-query-client/commit/cf359fd422caeff8220189b608aabf7c0cd7504b))
* add hooks for category plugin ([b671e54](https://github.com/graasp/graasp-query-client/commit/b671e54cf40ca89d70dd21e05d9ea4b1b0992c56))
* add hooks to get tags for multiple items ([1c20d85](https://github.com/graasp/graasp-query-client/commit/1c20d854b614eebf4efaba70f2c3a2393eb7a095))
* add import zip endpoint ([d7cf8bf](https://github.com/graasp/graasp-query-client/commit/d7cf8bf61b7cc31336c3def1a109c64597bde517))
* add item content hooks ([622fd48](https://github.com/graasp/graasp-query-client/commit/622fd4892e15c7f47b7271ee162153b25beaf3bb))
* add item flagging functionality ([ea392a7](https://github.com/graasp/graasp-query-client/commit/ea392a79e1c524cdc2630ab631029e93e3ea4837))
* add keepPreviousData to config ([fae88b7](https://github.com/graasp/graasp-query-client/commit/fae88b76cacfba431b52384d92112f1ea13e2f6e))
* add main template ([75a198d](https://github.com/graasp/graasp-query-client/commit/75a198d348d13c0f79c3195b05bc1e5ae646abcd))
* add message editing and mutations ([#141](https://github.com/graasp/graasp-query-client/issues/141)) ([4a83cba](https://github.com/graasp/graasp-query-client/commit/4a83cba1ca50e868917bef8f1d8fca29fc3e0ec7))
* add mutations to clear chat ([#154](https://github.com/graasp/graasp-query-client/issues/154)) ([fe8a3fa](https://github.com/graasp/graasp-query-client/commit/fe8a3fa9c04c4a445657caef79a138d7150ad931))
* add PATCH and DELETE item membership mutations ([e9f4d63](https://github.com/graasp/graasp-query-client/commit/e9f4d630536609f5f46bff6bf9d4f15cdfdc2cbd))
* add PATCH member ([b4226a8](https://github.com/graasp/graasp-query-client/commit/b4226a89fe6203154170e26576fa87fa4a4415fb))
* Add possibility to copy multiple files at one ([8a10e63](https://github.com/graasp/graasp-query-client/commit/8a10e633a6313666281fec4b4a9c7519cae1fc43))
* Add possibility to move multiples files at once ([e2fdd7a](https://github.com/graasp/graasp-query-client/commit/e2fdd7a89d039ab40deea53fcea1d28322d99250))
* add public items endpoints ([f703a79](https://github.com/graasp/graasp-query-client/commit/f703a79667210b2908c280ce65c4bdb8eceb53d4))
* add queries for category ([446f65e](https://github.com/graasp/graasp-query-client/commit/446f65eb2a22d7f1bdef9750a89b071427015ec3))
* add recycle bin endpoints ([76a53d1](https://github.com/graasp/graasp-query-client/commit/76a53d1045c4598b0be6bab5b3ed737914d8f745))
* add restore mutation, update delete mutations ([72d8121](https://github.com/graasp/graasp-query-client/commit/72d8121a038e1da0e47e4345e28b09a5370e042f))
* add route to delete member ([62907f8](https://github.com/graasp/graasp-query-client/commit/62907f83c71da941c9f6eca557927817137a7413))
* add route to retrieve single plan ([5938805](https://github.com/graasp/graasp-query-client/commit/59388054e2eb0fea21020d1286026385c67b5162))
* add subscription/ plans hooks and mutations ([9f1c594](https://github.com/graasp/graasp-query-client/commit/9f1c5948a647a4b6eefdcff929c09f58a52c88b1))
* add thumbnails mutations and hooks ([527183d](https://github.com/graasp/graasp-query-client/commit/527183d6f63f902f47b7ce30bb2ed08e04e75700))
* add useChildrenUpdates and useSharedItemsUpdates hooks ([167e313](https://github.com/graasp/graasp-query-client/commit/167e313cc0429f2200a88b715e9950c24ef9c87f))
* add websocket for delete message operation ([#139](https://github.com/graasp/graasp-query-client/issues/139)) ([9b111d9](https://github.com/graasp/graasp-query-client/commit/9b111d94e723ba80d40d21d6c92840aab4749b97))
* allow get many item memberships ([0a5205b](https://github.com/graasp/graasp-query-client/commit/0a5205b0e96321e114a165417e99223775cf695e))
* allow to get children of multiple items ([1ea3a2f](https://github.com/graasp/graasp-query-client/commit/1ea3a2f90451854d3d5a070d0814d690b2d0fcd6))
* allow user to choose card when paying ([c7d4573](https://github.com/graasp/graasp-query-client/commit/c7d45739049d9d05ce7a06b22973de8e9fcc602a))
* export hook ([e9c591a](https://github.com/graasp/graasp-query-client/commit/e9c591a7e9fd8350fc801e2e82dc241b6a5f40b8))
* get public items by tag hook, get public member, export api, use only named export ([ec515e0](https://github.com/graasp/graasp-query-client/commit/ec515e0e441c9053c5bee40f50f3a47017749796))
* implement single subscription for many handlers ([468999d](https://github.com/graasp/graasp-query-client/commit/468999d3b24b093ca849b89c8b9796514edaab7f))
* implement WebSocket client, add infrastructure stubs ([c7eb274](https://github.com/graasp/graasp-query-client/commit/c7eb2745441cd342d69e414f0fbf989667cbf8da))
* keyword search hook ([dc4fbf0](https://github.com/graasp/graasp-query-client/commit/dc4fbf0246a8770ef86b5374a6f4e414d535fc56))
* mutation for item publish ([3beb96c](https://github.com/graasp/graasp-query-client/commit/3beb96cf1d7591fe80f0c8b384f2487e7a5fe20a))
* refactor websocket client, add new real-time behaviours ([e836e7c](https://github.com/graasp/graasp-query-client/commit/e836e7c7e0913b624b07efa8971b907228754ed0))
* update member password ([d82be4f](https://github.com/graasp/graasp-query-client/commit/d82be4fac8fbf684e661bb9caea957ab883dfcde))
* update routes to be compatible with new file plugin ([a1058d4](https://github.com/graasp/graasp-query-client/commit/a1058d4f70a13bf16edaed51544bf0ae82642e8c))


### Bug Fixes

* a bug where if no data was previously stored in queryClient, WS deletions would write undefined value ([9587838](https://github.com/graasp/graasp-query-client/commit/9587838a21f982232f5480cbf1f5fa0113e282e4))
* add async ([8a87c2a](https://github.com/graasp/graasp-query-client/commit/8a87c2a665da6cfd83ba1d0007acedee70b7b83c))
* add enabled for useItemsInCategories ([aa6abf6](https://github.com/graasp/graasp-query-client/commit/aa6abf69ba00ab82b77dd087edded20ef11b8da5))
* add mutations for favorite item ([1299274](https://github.com/graasp/graasp-query-client/commit/12992741ae24fb0d117c51d7d7b69bc8e6a55182))
* add query prefix on post etherpad ([#222](https://github.com/graasp/graasp-query-client/issues/222)) ([f92986b](https://github.com/graasp/graasp-query-client/commit/f92986b049319bad07afc6c80dbd7bb6027d4b68))
* add tests, apply changes ([ea1328c](https://github.com/graasp/graasp-query-client/commit/ea1328c92521c3c42397dbc1d9aeb6c62cbe49a6))
* add types property to package.json ([414ce17](https://github.com/graasp/graasp-query-client/commit/414ce17fa0af0e94b8217a1f94c4e5480c919676)), closes [#133](https://github.com/graasp/graasp-query-client/issues/133)
* build moved item new path with parent ([154b863](https://github.com/graasp/graasp-query-client/commit/154b863eb6d7f71d6035ec54828f75579634ed30))
* call missing useEffect, use immutable data for chat ([ef4e533](https://github.com/graasp/graasp-query-client/commit/ef4e533eff7b58b446c0ed3a0adba75f0f6e5f52))
* change getFileContentWithUrl handle response ([e3a5159](https://github.com/graasp/graasp-query-client/commit/e3a5159da8995d9f6222ea4568eb72d311b8c8d0))
* change list to map ([c484e77](https://github.com/graasp/graasp-query-client/commit/c484e779871f988890bf658b84491498e7da3027))
* change route url to public ([c1cbc1a](https://github.com/graasp/graasp-query-client/commit/c1cbc1a10ee7a5b3703134c500d2eb3492291537))
* changes by review ([8c6cdb1](https://github.com/graasp/graasp-query-client/commit/8c6cdb16dbf88ac38f6bab1d27c99eba294f31f0))
* changes by review ([c0bfa0f](https://github.com/graasp/graasp-query-client/commit/c0bfa0fe7e9e27891236086ce7340556eaf7a72c))
* changes by review ([ce86263](https://github.com/graasp/graasp-query-client/commit/ce862638ccb2a08fb44c92bb5c0f7e3798c3a853))
* check window exists ([#176](https://github.com/graasp/graasp-query-client/issues/176)) ([0a13f53](https://github.com/graasp/graasp-query-client/commit/0a13f53f6e3b73456d34d1100bf7aec66bfaa38f))
* convert chat result to Map ([3bfe204](https://github.com/graasp/graasp-query-client/commit/3bfe2041e7a922225f56fc988e9f6bd86c961467))
* convert item updates to immutable Map ([7d5ea53](https://github.com/graasp/graasp-query-client/commit/7d5ea53a0a6910b183bb305bc83eb10d408a2751))
* correctly export buildDeleteMemberRoute ([3138b2b](https://github.com/graasp/graasp-query-client/commit/3138b2b1cdd7f9f7a78267fba08081b7aa88a160))
* correctly update items in the cache ([89d6448](https://github.com/graasp/graasp-query-client/commit/89d6448d1e460601c3a333917eaeaf60525fbabb))
* disable ws updates for useChildren if enabled option set to false ([01d0077](https://github.com/graasp/graasp-query-client/commit/01d0077ff7306e3a97520ed5c016b0bdf04dd3c9))
* do not check authentication for GET item login ([eb0381a](https://github.com/graasp/graasp-query-client/commit/eb0381a786f2089a10fad0dc283a73f484db705b))
* do not check user authentication on post item login ([0354aed](https://github.com/graasp/graasp-query-client/commit/0354aedcc5a144f827cc282229bb99b781af8ae9))
* do not order original array on hash ([c5370f1](https://github.com/graasp/graasp-query-client/commit/c5370f15bd7661dbe8ab49f0e4cf1edb55ca248b))
* do not update reference ([d52c634](https://github.com/graasp/graasp-query-client/commit/d52c634c44a4266c70eb6a665cf11a2ade3610a1))
* ensure serialized channel map keys are always identical (deep equality) ([0dc7684](https://github.com/graasp/graasp-query-client/commit/0dc76843cbfcf18efa8b443b20be290fbba9535d))
* ensures the email is always sent in lowercase ([09797b1](https://github.com/graasp/graasp-query-client/commit/09797b1f95a2b0edfd08aa1176b636ca3e298cf2))
* export route ([aa690de](https://github.com/graasp/graasp-query-client/commit/aa690de0833289b3e78b9eb01edc8e45df5254a8))
* export routes ([c4d128f](https://github.com/graasp/graasp-query-client/commit/c4d128f6c18bc14f8a0a23b862dee51192d2186a))
* fallback and merge private and public reponse for arrays ([2fe3623](https://github.com/graasp/graasp-query-client/commit/2fe36236b7dc3742627c31de2132f6ce0233ded6))
* fix according to review ([a965f8a](https://github.com/graasp/graasp-query-client/commit/a965f8acb6b3a3c6a27b68ee3053c844fbe2bcfa))
* fix according to review ([422fada](https://github.com/graasp/graasp-query-client/commit/422fada3ef32557d004eb5201a87c832b60680e6))
* fix bug ([2e851b9](https://github.com/graasp/graasp-query-client/commit/2e851b91bf5a35a12aa165c39c22ad625e0bb242))
* fix bugs in tests ([bc58b82](https://github.com/graasp/graasp-query-client/commit/bc58b8297771b07a6d1e70d567261ed24373784e))
* fix export ([16c135d](https://github.com/graasp/graasp-query-client/commit/16c135d56e85d8178e0a55730a59b154e2d7f53c))
* fix function name ([21b90c0](https://github.com/graasp/graasp-query-client/commit/21b90c07c51a6e70381f4b5e6f9950d7494d031d))
* fix function name ([c01b253](https://github.com/graasp/graasp-query-client/commit/c01b2532fe722224628134cd73c13345e6ab7db8))
* fix issues from comments ([8ca2f9d](https://github.com/graasp/graasp-query-client/commit/8ca2f9d1e8e4a04ab1c922c13be8b62fad0038b3))
* fix keys for useItemsInCategory ([618453c](https://github.com/graasp/graasp-query-client/commit/618453cdf756bb51455e2a909e4da91807eb137a))
* fix mutation keys ([53bfe67](https://github.com/graasp/graasp-query-client/commit/53bfe67231ca7dd7b9d6c30a4f814c796525b16b))
* fix parameters for get categories ([a9e4a1a](https://github.com/graasp/graasp-query-client/commit/a9e4a1a6e140e27d95ddc6cb0cb129de2aabe424))
* fix plans hoks ([8c93cc2](https://github.com/graasp/graasp-query-client/commit/8c93cc2edcfbf8a9569a5eb56d42c3688c12d754))
* fix query client due to backend changes ([981b3c9](https://github.com/graasp/graasp-query-client/commit/981b3c9ab7be1001ed4a3094a17faa146f427708))
* fix route ([2f42b0e](https://github.com/graasp/graasp-query-client/commit/2f42b0ec2bd057bcf357c44baa9489ad0d5dee2d))
* fix style issues, add tests for failing cases ([57630ab](https://github.com/graasp/graasp-query-client/commit/57630ab8da1c2c5d3d30f4233d8faaf670dfd01c))
* fix styles ([443ae1b](https://github.com/graasp/graasp-query-client/commit/443ae1be75ce2f058c900a2dc2fcb228b9eecbd3))
* fix typo ([acfb124](https://github.com/graasp/graasp-query-client/commit/acfb124e2cd2e60d1c4e9b2e403c1bdceac6b6ed))
* fix useItemsTags enabled condition ([0ff8f38](https://github.com/graasp/graasp-query-client/commit/0ff8f3898b60ea40d55312b1dc64b1a5c99e4b8b))
* fixed bugs in test ([7ca7e11](https://github.com/graasp/graasp-query-client/commit/7ca7e1199f4ae66b8314fc239cea4c88e3428d26))
* handle undefined ids input in hashItemIds and useItems query (cause of favorites crash) ([881eb81](https://github.com/graasp/graasp-query-client/commit/881eb811ce171d4815dec92bdeea74899e21726a))
* improve style ([b007980](https://github.com/graasp/graasp-query-client/commit/b0079801ae69384144acefc21b85049f6e3e1d48))
* include changes after review ([a8a7522](https://github.com/graasp/graasp-query-client/commit/a8a7522da9b79ddf21a5dc34ac78c0843c5d93b5))
* include changes after review ([abb4ef4](https://github.com/graasp/graasp-query-client/commit/abb4ef4e18a730610415ada14ad3b0de43375b02))
* include changes after review ([274a328](https://github.com/graasp/graasp-query-client/commit/274a32811367d8b68121deccd6c917245e0b699d))
* make defaultConfig properties optional ([1bfb093](https://github.com/graasp/graasp-query-client/commit/1bfb0936896719270666a725cfc577a98ef4af0a))
* match key name ([2fb26ac](https://github.com/graasp/graasp-query-client/commit/2fb26ace80c310251fa0ede91aadfe6188ba4189))
* minor change by review ([ecdd970](https://github.com/graasp/graasp-query-client/commit/ecdd970f1d45bd5f0ddaf707eccfed6cbdad85f7))
* minor fix ([fd35fe3](https://github.com/graasp/graasp-query-client/commit/fd35fe3225362ce6523e70f5a76f4e3e4112af53))
* minor fix by review ([6318b5e](https://github.com/graasp/graasp-query-client/commit/6318b5e95d02c3727b9cac4a85998fda4191bc08))
* minor fix, export all data keys ([643a71a](https://github.com/graasp/graasp-query-client/commit/643a71a41a7cc0aa3e0b2e043cef615aa60f1006))
* modify onMutate ([849e442](https://github.com/graasp/graasp-query-client/commit/849e44249839a8688bdfaa1fab6aa7aa491fb3a3))
* npm publish composite ([7ab0607](https://github.com/graasp/graasp-query-client/commit/7ab060791be8ed261170c84095f2e55b96b07885))
* remove auth check ([460e1b9](https://github.com/graasp/graasp-query-client/commit/460e1b90863b71a9500efb312e1835de902adc6b))
* remove console.log and create new trimmed object ([6b3a055](https://github.com/graasp/graasp-query-client/commit/6b3a055ebb6892ee025898db1793bfd8e229ba11))
* remove cookie when logout is confirmed, prevents logout loop ([d803035](https://github.com/graasp/graasp-query-client/commit/d80303516deacea0a1bbd9bd9daef020870f39c0))
* remove ITEM_KEYS enum ([8fa3b0e](https://github.com/graasp/graasp-query-client/commit/8fa3b0e3f2893ca42846ada56311e5d85bdab059))
* remove non-existing previousMember in onError ([59c2e5c](https://github.com/graasp/graasp-query-client/commit/59c2e5c71de10ec56a1e2c7e8ac948e5c00364e9))
* remove unnecessary clause ([a196863](https://github.com/graasp/graasp-query-client/commit/a196863918e3b06395dbc89375c6b38d71b86e4c))
* remove unused onMutate function ([7566c7c](https://github.com/graasp/graasp-query-client/commit/7566c7c88d19729d178b2e8881220f48ff888292))
* saves full item when editing item ([2de4779](https://github.com/graasp/graasp-query-client/commit/2de4779994044e408bc079e70368669b083e4099))
* trim items names on add and edit ([8ce95a0](https://github.com/graasp/graasp-query-client/commit/8ce95a0214303c4704cdcb6c863cc02a7bccf5b1))
* typos, disable WS by default, fix bug of wrong removal if handler is not found ([34cd950](https://github.com/graasp/graasp-query-client/commit/34cd95085bfc9243303ae03ea1a50889b2a4e73a))
* update get memberby route and add getMembers route ([ed2e1c3](https://github.com/graasp/graasp-query-client/commit/ed2e1c3ad1e3714360a7b4770e889f90695caa05))
* update items thumbnails upload route ([17b8990](https://github.com/graasp/graasp-query-client/commit/17b89907e583f8232e51facf18554dbfac159e1e))
* update key for usePlan ([1968860](https://github.com/graasp/graasp-query-client/commit/19688608fe18452a7f6fa695e4c9d762915b5b60))
* update to use axios ([799bde3](https://github.com/graasp/graasp-query-client/commit/799bde3cb3c034f06c741ad9f3cbd3a08573fedb))
* use JSON serdes for Map key deep equality, fix subscribed condition and cleanup ([88ec19d](https://github.com/graasp/graasp-query-client/commit/88ec19db1287d4ffbf55f65cb66fe3af1de729ba))
* use size instead of isempty ([acae1cc](https://github.com/graasp/graasp-query-client/commit/acae1ccef3a7613d400efdf45a3c899c5cfe18e6))


### Documentation

* update author and contributors for npm ([793a5dd](https://github.com/graasp/graasp-query-client/commit/793a5dd6313ce25a4a440f27ec769769cd2aeb5a))
