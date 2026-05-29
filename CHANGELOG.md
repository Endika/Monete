# Changelog

## [1.5.2](https://github.com/Endika/Monete/compare/v1.5.1...v1.5.2) (2026-05-29)


### Bug Fixes

* **guest:** hide 'not listed' button once a family is claimed ([ced838f](https://github.com/Endika/Monete/commit/ced838f1a4accb12d6cf4fcda9847e8ba7033947))

## [1.5.1](https://github.com/Endika/Monete/compare/v1.5.0...v1.5.1) (2026-05-29)


### Bug Fixes

* **guest:** show 'this is us' only when no family claimed ([b2f92ae](https://github.com/Endika/Monete/commit/b2f92ae58681805e54830457076d7248adbfb1b7))

## [1.5.0](https://github.com/Endika/Monete/compare/v1.4.0...v1.5.0) (2026-05-29)


### Features

* **geo:** google places autocomplete with photon fallback ([6b3c4b6](https://github.com/Endika/Monete/commit/6b3c4b6675a21b7df679c3a818d729af0ae58e99))

## [1.4.0](https://github.com/Endika/Monete/compare/v1.3.0...v1.4.0) (2026-05-29)


### Features

* **map:** embedded google map with keyless fallback ([a18f631](https://github.com/Endika/Monete/commit/a18f6316951af9f3827c64b93ddf9c5b3cf99de8))

## [1.3.0](https://github.com/Endika/Monete/compare/v1.2.0...v1.3.0) (2026-05-29)


### Features

* **guest:** claim your family via this-is-us, with un-claim ([c5e2393](https://github.com/Endika/Monete/commit/c5e239336a2cefdf75fa8c39925e73ead967e982))


### Bug Fixes

* **ui:** use LanguageSwitcher (flag icons) in footer ([a643ff2](https://github.com/Endika/Monete/commit/a643ff25a8b1c059518a3c01fa796c8787dd765c))

## [1.2.0](https://github.com/Endika/Monete/compare/v1.1.0...v1.2.0) (2026-05-29)


### Features

* **domain:** sibling flag, event coords, schema 3 ([d1969c6](https://github.com/Endika/Monete/commit/d1969c63597c2ac14634d6aad7fd506771752a4f))
* **geo:** photon address search and maps coords link ([415f1c5](https://github.com/Endika/Monete/commit/415f1c5a5b6eea5a24245dff3edd0200a5965789))
* **guest:** autofill first child and sibling checkbox ([46f4873](https://github.com/Endika/Monete/commit/46f4873ff5fb4ed77e58878f3fd658393b97cd00))
* **guest:** which-family prompt, not-listed, back ([a78312b](https://github.com/Endika/Monete/commit/a78312b2803faa20d70f6694d1d78a9340c1bb5f))
* **host:** sibling tags and invited/sibling breakdown ([7ea9756](https://github.com/Endika/Monete/commit/7ea975677895080fdfa0d503093925eb5c540354))
* **i18n:** v1.2 keys and festive exclamation polish ([066476a](https://github.com/Endika/Monete/commit/066476a2654925c29eb81a0e8bebf63330a2f3fd))
* **presentation:** headcount invited vs siblings ([774fd33](https://github.com/Endika/Monete/commit/774fd33811504ac1ebc3b32fdaf576fc96939d6a))
* **ui:** clickable header logo with home nav ([a9d377c](https://github.com/Endika/Monete/commit/a9d377ce24691ed426d48df624d6db59802c167b))
* **ui:** keyless address autocomplete with coords ([a437308](https://github.com/Endika/Monete/commit/a43730805dda17ad2ee42a919cbe2d77a0bd614d))


### Bug Fixes

* **calendar:** render menu in-flow so it is not clipped ([1249ec4](https://github.com/Endika/Monete/commit/1249ec49faa8f386dab9925fcad04ea3348ecc89))
* **v1.2:** forward lat/lng, preserve isSibling on edit, autofill guard ([8659f93](https://github.com/Endika/Monete/commit/8659f935f17f10019df3807467eb7ada7a0084d4))

## [1.1.0](https://github.com/Endika/Monete/compare/v1.0.1...v1.1.0) (2026-05-29)


### Features

* **application:** rsvp edit/remove handlers + allDay dtos ([7922e2a](https://github.com/Endika/Monete/commit/7922e2acb3de225ec86aa5939c966dd832403182))
* **calendar:** two reliable add-to-calendar options ([9dbe924](https://github.com/Endika/Monete/commit/9dbe924fdf228c33142714c3d49b472318d2b7fe))
* **db:** party_sizes monitoring view migration ([4762eea](https://github.com/Endika/Monete/commit/4762eeab2b59c1d1c1ef111f465757f0fed38bff))
* **domain:** add allDay to event details, bump schema to 2 ([afef3a2](https://github.com/Endika/Monete/commit/afef3a2b49f3bf7765e80cd7d7556a40b90a436e))
* **domain:** update and remove rsvp by id ([df05f87](https://github.com/Endika/Monete/commit/df05f8746e6c3875d6b0ebbd46a99177d5b21dc0))
* **guest:** participant list, open edit, add another family ([f4c0add](https://github.com/Endika/Monete/commit/f4c0add291c18b03c4256ef9d8cd832dc2d0e9c0))
* **home:** my-parties dashboard (organizing/attending) ([c7e1ff9](https://github.com/Endika/Monete/commit/c7e1ff954e9b09ee6a581954adfaa4325f9c1c14))
* **host:** add/edit/delete participant responses ([e3eb903](https://github.com/Endika/Monete/commit/e3eb9030169c7bb087bb02a125ae8bba04665c35))
* **i18n:** keys for my-parties, edit, calendar, maps ([a75d4de](https://github.com/Endika/Monete/commit/a75d4de180567e3006137023eafff5620b5dbac3))
* **i18n:** language switcher with flag icons ([9409230](https://github.com/Endika/Monete/commit/9409230b0876b6e58f0dac3d6dde19d8d3f13d6d))
* **persistence:** device-local recents store ([2a5e591](https://github.com/Endika/Monete/commit/2a5e59178481b0a3e1ad94c2f1648552d4073f4b))
* **persistence:** rsvp edit/remove migration and repo test ([a5581c8](https://github.com/Endika/Monete/commit/a5581c8a368769c449e64395169b4b13f05ffd6e))
* **persistence:** update/remove rsvp on repository ([991f3e3](https://github.com/Endika/Monete/commit/991f3e3a73ec2c00f4527d27481b4988330f5836))
* **ui:** date-first time fields and maps address link ([1eab6c7](https://github.com/Endika/Monete/commit/1eab6c765cc98a878e5f9c21bc1f03a1c6ba95bc))
* **util:** all-day calendar (.ics and google) ([412a8f6](https://github.com/Endika/Monete/commit/412a8f6cf1378c960709b7f7fce81e6db8cf1889))
* **util:** event date/time compose and split ([fa7f1d5](https://github.com/Endika/Monete/commit/fa7f1d55c53078b6ac56b834d6ee292bd2997a2d))
* **util:** google maps search url ([541b2d4](https://github.com/Endika/Monete/commit/541b2d4b991f05e04a33c5a4ca1c911986d32f0a))


### Bug Fixes

* **util:** store event times as utc iso for dto validity ([6eafdfb](https://github.com/Endika/Monete/commit/6eafdfb8b285bbbbb237b47c9aec4883fe33c0f4))
* **v1.1:** forward allDay, reseed edit form, i18n hardcoded labels ([3769a70](https://github.com/Endika/Monete/commit/3769a70b8bb586888a0bbbdb71d1aa56cc8a2916))

## [1.0.1](https://github.com/Endika/Monete/compare/v1.0.0...v1.0.1) (2026-05-29)


### Bug Fixes

* **routing:** build party links with base path ([2950f9b](https://github.com/Endika/Monete/commit/2950f9bc31bbaba3ddc89a1b46901f187db9b6d6))

## [1.0.0](https://github.com/Endika/Monete/compare/v0.1.0...v1.0.0) (2026-05-29)


### Features

* **application:** create party handler ([bc95dc9](https://github.com/Endika/Monete/commit/bc95dc93ec0f4dc511c99d5968e6d13827a5e5b5))
* **application:** host config handlers ([164399d](https://github.com/Endika/Monete/commit/164399d7515d7d0e8b9923c6ae3de66696491176))
* **application:** optimistic retry helper ([a52e81e](https://github.com/Endika/Monete/commit/a52e81e6e1dbca3d11e869651302fdc57d5eb9a3))
* **application:** submit rsvp and refresh party handlers ([b0731ff](https://github.com/Endika/Monete/commit/b0731ffb27005407a5ce062dd1c333706d00ee74))
* **app:** routing shell and entry point ([3b4943a](https://github.com/Endika/Monete/commit/3b4943a29837635458b94850f440671ffeca8d7f))
* **di:** container and wiring ([d6271dd](https://github.com/Endika/Monete/commit/d6271dd68b3c0063404773487b99a7921d6214a7))
* **domain:** add EditPin value object ([fa48f80](https://github.com/Endika/Monete/commit/fa48f80e80fda17df5e2a5a2d5b99049a5bcfb21))
* **domain:** add Party entity types and create ([046f000](https://github.com/Endika/Monete/commit/046f0001ba578ff09b76d6b5dcdb09aa7b61e8fd))
* **domain:** add PartyId value object ([6b3380e](https://github.com/Endika/Monete/commit/6b3380ef41e1113eb6e238c5f6cee377b63343c7))
* **domain:** edit party details and pin ([f0026f7](https://github.com/Endika/Monete/commit/f0026f7f58456fe5a6d999c8da47a078ea80ac04))
* **domain:** party question management ([359bfde](https://github.com/Endika/Monete/commit/359bfde2d9e8902acfe181a190df77409ef2d9e7))
* **domain:** validate and build family rsvp ([a8f138b](https://github.com/Endika/Monete/commit/a8f138b41100143b43b8b682502434fef16b94ba))
* **guest:** add to calendar button ([1f42b91](https://github.com/Endika/Monete/commit/1f42b91b0f7ada16ad5b2a38649ea992deb9682c))
* **guest:** rsvp form and guest page ([c362b01](https://github.com/Endika/Monete/commit/c362b019ddb31bfda8a19d587194f81f1406da17))
* **home:** create party form ([e080e12](https://github.com/Endika/Monete/commit/e080e125329baacc2fa5721c0809a5315904bf42))
* **host:** headcount view and venue summary ([76e80f1](https://github.com/Endika/Monete/commit/76e80f1bd912038e804191b26be014df4f904035))
* **host:** pin gate and host dashboard ([6b22895](https://github.com/Endika/Monete/commit/6b22895eaa56ec083373eaa80b5bb23edb65622d))
* **host:** question builder and standard presets ([fb2740a](https://github.com/Endika/Monete/commit/fb2740a86de615fcefe7d909b09d949e848ac82e))
* **i18n:** config and base locales ([4aa30a6](https://github.com/Endika/Monete/commit/4aa30a69faef78e0846b05e2c3a83e124dfb0e2d))
* **i18n:** translate es, gl, eu, ca, va locales ([08cab0f](https://github.com/Endika/Monete/commit/08cab0f47c2506ccd76fb7c9902ca904540af541))
* **persistence:** in-memory party repository fake ([b66c035](https://github.com/Endika/Monete/commit/b66c035df00975f29cc58a598c38f132a4991c3b))
* **persistence:** parties table, append_rsvp rpc, schema guard ([b21fa52](https://github.com/Endika/Monete/commit/b21fa52eb982be7c1671f0491617186c1bdf83e6))
* **persistence:** party repository port and schema version ([adc4763](https://github.com/Endika/Monete/commit/adc476311a3b619d04e5089f13d8e53ff0a48e31))
* **persistence:** party snapshot zod schema ([0f4e83e](https://github.com/Endika/Monete/commit/0f4e83e017af3d67ca734419801ca80650ef8561))
* **persistence:** supabase party repository ([0ad4c54](https://github.com/Endika/Monete/commit/0ad4c54445407dd9d1d9432229970aac60286350))
* **presentation:** calendar links and whatsapp share ([f69b879](https://github.com/Endika/Monete/commit/f69b8792c4f887c366f6279926fd89f6c6e9cb65))
* **presentation:** headcount derivation ([aa97c7e](https://github.com/Endika/Monete/commit/aa97c7ebf0e107cb1c0d5ce3b2607ac301c83a2f))
* **presentation:** primitives, container and party context ([daa3811](https://github.com/Endika/Monete/commit/daa3811788063ef8dbe23503fe68f65b3cd0b739))
* **presentation:** venue summary formatter ([315e18d](https://github.com/Endika/Monete/commit/315e18dc0722ca45ddc96318534943ba1436c992))
* **ui:** childlike crayon monkey mascot ([b5ff0f7](https://github.com/Endika/Monete/commit/b5ff0f711ff6fba7cc2e8ed945fcf5d5f4a94aa6))
* **ui:** festive redesign of screens and warmer Spanish copy ([839d43f](https://github.com/Endika/Monete/commit/839d43f00272bfe08699c6d620dda94e1dd91402))
* **ui:** festive theme foundation and primitives ([babdc64](https://github.com/Endika/Monete/commit/babdc64283c4c19adc74dfc717a2549c105c8069))
* **ui:** footer version, PWA banners, language switcher ([d9685dc](https://github.com/Endika/Monete/commit/d9685dc81022b05005278f52e83df4cba4629681))
* **ui:** hand-drawn freehand monkey mascot ([8cbc23d](https://github.com/Endika/Monete/commit/8cbc23d1794b56bcc3197771416ad269999c3497))
* **ui:** monkey mascot, favicon and PWA icons ([3a92820](https://github.com/Endika/Monete/commit/3a92820df5c9d0decc9747ba982df6a43e4bc0ab))
* **ui:** redraw mascot as a cheerful cartoon monkey ([f444b4c](https://github.com/Endika/Monete/commit/f444b4ccfbc6c4f20bdec7de18006a2f0541f7ed))
* **ui:** refine monkey mascot and icons for legibility ([63d2da8](https://github.com/Endika/Monete/commit/63d2da823e00a5f25c7f0a980096bfcd2ede59b8))
* **ui:** warm cheerful cartoon monkey mascot ([83dbde1](https://github.com/Endika/Monete/commit/83dbde18ef7e556aac966d5b80d29d226ba63e14))


### Bug Fixes

* **domain:** copy answer maps and event to preserve immutability ([36daa02](https://github.com/Endika/Monete/commit/36daa0285788243c9a69e0fc4ee4167800472601))
* **presentation:** form sync, stable keys, i18n, modal, feedback ([43190db](https://github.com/Endika/Monete/commit/43190db015c465eb5340707fe269e4d0812d4f79))


### Chores

* **deps-dev:** bump @commitlint/cli from 20.5.3 to 21.0.2 ([c806e8b](https://github.com/Endika/Monete/commit/c806e8b191c9b6cb964ae193939d1f112ee58023))
* **deps-dev:** bump @commitlint/config-conventional ([2476a83](https://github.com/Endika/Monete/commit/2476a83f50a32dd90b82bb9c64834310f8d2935b))
* ignore internal planning notes ([35b2aef](https://github.com/Endika/Monete/commit/35b2aefa38c43bccbbd9a2135cbeb05e669fb41e))
* readme and release flow alignment ([47d5481](https://github.com/Endika/Monete/commit/47d5481eff48e76c737c132662ef41cf6d1e26e5))
* release Monete 1.0.0 ([7115d6b](https://github.com/Endika/Monete/commit/7115d6b74eeab6cafa3d7f857d655d03f5fed0f4))
* scaffold Monete from sibling-app template ([aea7daa](https://github.com/Endika/Monete/commit/aea7daa4e60c2ea828e782a8e783d3ce957b37d9))
