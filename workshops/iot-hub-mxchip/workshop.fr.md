---
short_title: Workshop IoT
description: Discover how to build connected IoT experiences using an Arduino board and Azure services.
type: workshop
authors:
  - Jim Bennet
  - Christopher Maneu
  - Wassim Chegham
  - Olivier Leplus
  - Yohan Lasorsa
contacts:
  - '@jimbobbennett'
  - '@cmaneu'
  - '@manekinekko'
  - '@olivierleplus'
  - '@sinedied'
banner_url: assets/iot-banner.jpg
duration_minutes: 180
audience: students, pro devs
tags: iot, mxchip, azure, vs code
published: true
sections_title:
  - Introduction
---

# Développez un projet IoT connecté avec la carte MXChip et Azure

Ce workshop, accessible à **tous les développeurs même sans connaissance en IoT ou sur Azure -**, vous permettra de 
découvrir la programmation sur des devices IoT avec ([Arduino](https://www.arduino.cc)) et [Visual Studio Code](https://code.visualstudio.com/)), ainsi que 
la création d'expériences connectées avec les services [Azure](https://azure.microsoft.com/)).

## Pré-requis

Afin de réaliser ce workshop, vous aurez besoin: 

- D'un PC (ou Mac) de développement, sur lequel il faudra installer un certain nombre d'outils et de drivers,
- D'un abonnement Azure (d'essai, payant ou MSDN),
- Dans l'idéal, d'une carte de développement [MXChip](https://docs.microsoft.com/azure/iot-develop/quickstart-devkit-mxchip-az3166) ([acheter](https://www.seeedstudio.com/AZ3166-IOT-Developer-Kit.html)), ou de l'émulateur.

---

## Préparer sa machine de dev

Afin de pouvoir développer, puis déployer à la fois sur le board MXChip et sur Azure, il vous faudra plusieurs outils
(gratuits): 

- [.NET Core 3.1](https://dotnet.microsoft.com/download)
- [Visual Studio Code](https://code.visualstudio.com/) ainsi que quelques extensions
    - L'extension [Azure IoT tools](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools) ([Installer](vscode:extension/vsciot-vscode.azure-iot-tools)), qui contient notamment _IoT Workbench_,
    - L'extension [Arduino](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.vscode-arduino) de l'éditeur Microsoft,
    - L'extension [Azure Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-node-azure-pack),
    - Les extensions pour les langages que vous allez utiliser
        - [C#](https://marketplace.visualstudio.com/items?itemName=ms-vscode.csharp),
        - JavaScript est déjà inclus :)
- [Arduino IDE](https://www.arduino.cc/en/Main/Software): il contient les outils de builds et de déploiment pour la carte MXChip. **Attention:** Installez la version "standalone", et non pas la version du Store.
- Le driver _ST-Link_: 
	- Windows
	Télécharger et installer le driver depuis le site [STMicro](http://www.st.com/en/development-tools/stsw-link009.html).

	- macOS
	Pas de driver nécessaire

	- Ubuntu
  	Exécuter la commande suivante dans votre terminal, puis déconnectez/reconnectez-vous afin d'appliquer le changement 
    de permissions

		```bash
		# Copy the default rules. This grants permission to the group 'plugdev'
		sudo cp ~/.arduino15/packages/AZ3166/tools/openocd/0.10.0/linux/contrib/60-openocd.rules /etc/udev/rules.d/
		sudo udevadm control --reload-rules
		
		# Add yourself to the group 'plugdev'
		# Logout and log back in for the group to take effect
		sudo usermod -a -G plugdev $(whoami)
		```

L'installation d'une extension Visual Studio peut se faire par ligne de commande, ou directement dans l'interface via 
l'onglet "extensions" (le 5ème icône sur la gauche).

![Installer IoT Device Workbench](assets/install-workbench.png)

Si vous souhaitez installer l'ensemble des extensions, voici un script pour Windows: 
```
code --install-extension vsciot-vscode.azure-iot-tools
code --install-extension vsciot-vscode.vscode-arduino
code --install-extension ms-vscode.vscode-node-azure-pack
code --install-extension ms-vscode.csharp
```

Une fois l'ensemble de ces composants installés, il faudra s'assurer que Visual Studio Code puisse utiliser l'installation
d'Arduino. Ouvrir **File > Preference > Settings** et ajouter les lignes suivantes à votre configuration.

![Configurer Arduino path](assets/iot-workbench-setting.png)

Voici les valeurs par défaut à ajouter à cette configuration:

* Windows

    ```JSON
    "arduino.path": "C:\\Program Files (x86)\\Arduino",
    "arduino.additionalUrls": "https://raw.githubusercontent.com/VSChina/azureiotdevkit_tools/master/package_azureboard_index.json"
    ```

* macOS

    ```JSON
    "arduino.path": "/Applications",
    "arduino.additionalUrls": "https://raw.githubusercontent.com/VSChina/azureiotdevkit_tools/master/package_azureboard_index.json"
    ```

* Ubuntu

    ```JSON
    "arduino.path": "/home/{username}/Downloads/arduino-1.8.5",
    "arduino.additionalUrls": "https://raw.githubusercontent.com/VSChina/azureiotdevkit_tools/master/package_azureboard_index.json"
	```

**Pensez à sauvegarder vos paramètres avant de passer à l'étape suivante !**

Enfin il faudra ajouter le SDK spécifique pour la board Arduino MXChip. Pour cela, via la palette de commande (`Ctrl+Shift+P`
 ou `Cmd+Shif+P`), ouvrir la page **Arduino: Board Manager**, et rechercher **AZ3166**, puis installer la version **1.6.0** (les autres versions suppérieures 1.6.0+ ne sont pas encore compatibles avec le SDK).

![Installer le SDK MXChip](assets/install-sdk.png)

---

## Préparer son environnement Azure

Afin de réaliser cet atelier, vous aurez besoin d'une souscription Azure. Il y a plusieurs moyens d'en obtenir une: 

- (**Obligation**) Si vous lisez cet atelier durant le Roadshow, vous pouvez utiliser l'Azure Pass que nous vous fournissons,
- Ou si vous êtes abonnés MSDN, utiliser les crédits offerts par votre abonnement.
- Ou créer un [abonnement d'essai](https://azure.microsoft.com/en-us/free/),

### Utiliser votre Azure Pass

1. Rendez-vous sur [microsoftazurepass.com](https://www.microsoftazurepass.com/) et cliquez sur **Start**,
![Démarrer l'utilisation du pass](assets/redeempass-1.jpg)
2. Connectez vous avec un compte Microsoft Live **Vous devez utiliser un compte Microsoft qui n'est associé à aucune
 autre souscription Azure**
3. Vérifiez l'email du compte utilisé et cliquez sur **Confirm Microsoft Account**
![Confirmer le compte](assets/redeempass-2.jpg)
4. Entrez le code que nous vous avons communiqués, puis cliquez sur **Claim Promo Code** (et non, le code présent sur la
 capture d'écran n'est pas valide ;) ),
![Indiquer son code](assets/redeempass-3.jpg)
5. Nous validons votre compte, cela prend quelques secondes
![Validation du code](assets/redeempass-4.jpg)
6. Nous serez ensuite redirigé vers une dernière page d'inscrption. Remplissez les informations, puis cliquez sur **Suivant**
![Entrer les informations](assets/redeempass-5.jpg)
7. Il ne vous restera plus que la partie légale: accepter les différents contrats et déclarations. Cochez les cases que 
vous acceptez, et si c'est possible, cliquez sur le bouton **Inscription**
![Accepter les conditions légales](assets/redeempass-6.jpg)

Encore quelques minutes d'attente, et voilà, votre compte est créé ! Prenez quelques minutes afin d'effectuer la 
visite et de vous familiariser avec l'interface du portail Azure.

![Accueil du portail Azure](assets/redeempass-7.jpg)

---

## Configurez votre board

<div class="alert">

Votre board est normalement déjà configurée. Vous n'avez rien à faire, sauf en cas de souci de connection.

</div>

### Configurer le Wi-Fi de votre MX Chip

Si vous avec besoin de reconnecter votre board au WiFi, suivez ces instructions.

1. Maintenir appuyé le bouton **B**, appuyer et relacher le bouton **Reset** , puis relâcher le bouton **B**. La board va alors passer en mode _configuration WiFi_. Pour se faire, il va lui-même diffuser un point d'accès auquel se connecter. L'écran affiche ainsi le SSID, ainsi que l'adresse IP à utiliser.

    ![Reset button, button B, and SSID](assets/wifi-ap.jpg)

2. Connectez-vous au réseau WiFi indiqué sur la board. Si votre appareil demande un mot de passe, laissez-le vide.

    ![Network info and Connect button](assets/connect-ssid.png)

3. Ouvrez **192.168.0.1** dans un navigateur. Sélectionnez le réseau sur lequel vous souhaitez vous connecter. Indiquez la clé WEP/WPA, puis cliquez sur **Connect**.

    ![Password box and Connect button](assets/wifi-portal.png)

4. La board va redémarrer quelques secondes après. Elle affichera alors le nom du wifi ainsi que son adresse IP directement sur l'écran: 

    ![Wi-Fi name and IP address](assets/wifi-ip.jpg)

---

## Créer vos services dans Azure

Nous allons maintenant utiliser le [portail Azure](https://portal.azure.com/?feature.customportal=false) afin de créer l'ensemble des services dans Azure - 
appelée _ressources_. Si vous êtes plus bash que clic, vous pouvez utiliser la [Azure CLI](https://docs.microsoft.com/cli/azure/?view=azure-cli-latest) (on vous laisse 
chercher comment faire 😉. 

### Créer un resource group

Nous allons commencer par créer un groupe de ressources (_resource group_). C'est un conteneur logique pour l'ensemble 
des services que vous allez créer ensuite. Chaque service doit absolument être dans un resource group.

Depuis le portail Azure, vous avez trois moyens de créer une nouvelle ressource : 

- Le bouton **Créer une ressource** en haut à gauche,
- Naviguer vers un type de service, puis cliquer sur le bouton **Ajouter**
- Depuis la page du groupe de ressources, cliquer sur le bouton **Ajouter**

La vidéo suivante vous montre comment créer votre premier groupe de ressources. Le nom du groupe de ressource doit être 
unique au sein de votre compte Azure. Pour ce qui est de la région, nous choisirons tout au long de cet atelier _Europe 
Occidentale_ ou _West Europe_.

![Video - Création d'un ressource group](assets/creation-rg.gif)

Une fois créé, vous pouvez vous rendre sur la page de la ressource via l'icône de notifications en haut.

### Créer un IoT Hub

L'IoT Hub est un service qui vous permet de gérer la connexion entre vos devices IoT et vos services hébergés sur Azure 
(ou ailleurs). Plus concrètement, il vous permet : 

- D'identifier et de recevoir des données de vos périphériques IoT - on appelle cela le _Device To Cloud_,
- D'envoyer ces données à différents applicatifs,
- De transmettre des commandes ou des données du cloud vers vos périphériques - c'est le _Cloud To _Device_, 
- De mettre à jour les micrologiciels à distance de vos périphériques, voire de déployer du code à distance.

La vidéo suivante nous montre comment créer un nouveau IoT Hub. Choisissez bien le groupe de ressources créé à l'étape 
précédente, puis choisissez la région (Europe occidentale) puis un nom.

<div class="info" data-title="Note">

> Comme beaucoup de ressources dans Azure, leur nom devient une partie d'une adresse Internet - ici 
`monhub.wassim-ioth.azure-devices.net`. Il doit donc être unique à tous les utilisateurs d'Azure !

</div>

A l'étape d'après, vous serez amené à choisir un niveau de tarification (_tier_) et une mise à l'échelle. Pour cet 
atelier, nous choisirons la taille **S1: Niveau Standard**.

<div class="info" data-title="Note">

> Il existe à aujourd'hui trois tiers. Le tiers gratuit est limité en nombre de messages, alors que le tiers basique ne 
dispose pas des fonctionnalités _Cloud to Device_ ou _Device Twins_ que nous allons utiliser plus loin. Le nombre 
d'unités permet quand à lui de supporter un plus grand nombre de périphériques IoT.

</div>

![Video - Création d'un IoT Hub](assets/creation-iothub.gif)

### Créer un IoT Device

Au sein du IoT Hub, chacun de vos périphériques IoT se doit d'être déclaré afin de pouvoir le gérer et accepter des 
données. Pour cet atelier simple, nous allons ajouter le périphérique à la main. Si nous avions à déployer des milliers 
de périphériques, il y a bien évidemment [une solution](https://docs.microsoft.com/fr-fr/azure/iot-dps/)] :)

La création d'un device IoT dans le portail est assez simple. Naviguez jusqu'à l'onglet **Appareils IoT**, puis cliquez 
sur **Ajouter**. Vous avez alors simplement à donner un nom à votre périphérique.

![Video - Création d'un périphérique IoT Hub](assets/creation-iotdevice.gif)

Lorsque vous vous rendez sur l'écran de votre appareil IoT, vuos verrez alors deux clés : **Ce sont elles qui permettent 
de sécuriser la connexion entre votre appareil et Azure**. Il est important **de ne pas les diffuser ou les mettre dans 
votre code source (ou repository Github)**. Nous verrons plus tard comment la déployer sur la carte.

<div class="tip" data-title="Astuce">

> **Notez cette clé d'accès quelque part** ou gardez la fenêtre ouverte, nous allons l'utiliser dans quelques étapes.

</div>

Nous en avons pour l'instant fini avec IoT Hub, mais nous reviendrons plus tard sur cette partie.

### Créer une Azure Function

Notre site web sera simplement un "Front HTML". Il lui faudra communiquer avec l'IoT Hub, et pour cela utiliser un
 _secret_. Afin de protéger ce secret et de limiter ce qu'il est possible de faire, nous allons créer une API contenant 
 cette logique et ce secret. Nous pourrions l'héberger dans un site web - comme celui que nous avons créé il y a 
 quelques instants - mais Azure Functions est un service intéressant pour cet usage : il vous permet d'héberger non pas 
 un site web, mais simplement une méthode de code !

Lors de la création, il vous faudra indiquer un nom et un emplacement. Hormis ces informations et le groupe de 
ressources, laissez tous les autres paramètres à leurs valeurs par défaut.

![Video - Création d'une Azure Function](assets/creation-function.gif)

---

## Déployez du code sur votre board et connectez-là à Azure

Si vous avez installés tous les prérequis, et que votre board est [connectée à Internet](docs/configurer-wifi.md), alors
 nous pouvons continuer. Notre première étape est de créer un projet **Azure IoT Workbench Visual Studio Code**. Ce type de projet va nous apporter toutes les fonctionnalités nécessaires pour travailler: builder le code, configurer la carte, déployer le code sur la carte, etc...

 Dans la suite de cet atelier, nous allons utiliser beaucoup de commandes. Celles-ci sont accessibles via le raccourci clavier `Ctrl+Shift+P` (ou `Cmd+Shift+P` sous Mac). Pour créer votre projet: 
 
 1. Recherchez `Workbench create`, et choisissez `Azure IoT Device Workbench: Create Project`
 2. Sélectionnez `IoT DevKit`
 3. Selectionnez le template `With Azure IoT Hub`
 4. Choisissez un dossier dans lequel enregistrer vos fichiers sources

> Nous allons créer plusieurs projets lors de cet atelier. Je vous suggère la hiérarchie de dossiers suivante : 
> ```
> MonProjet
>  | - device
>  | - fonction
>  | - web
> ```
> 

![Video - Création d'une Azure Function](assets/creation-projetIoT.gif)

Nous pouvons désormais copier-coller le [contenu du fichier `.ino`](https://raw.githubusercontent.com/themoaw/DevRoadShow-IOT/master/src/arduino/DevKitState.ino) . A cette étape, il est possible de compiler le code avec la commande `Azure IoT Device Workbench: Compile Device Code`.

Il nous reste désormais deux choses à faire: connecter la board à notre IoT Hub, et déployer le code sur le device. Pour la connection, nous allons simplement envoyer la chaîne de connexion - créée au début du tutoriel - sur la board. Au préalable, assurez-vous que Visual Studio a bien sélectionné votre type de board ainsi que le port série (émulé via l'USB).

![Sélecteur Visual Studio Code de board et de port série](assets/vscode-com.jpg)

1. Maintenez appuyé le bouton **A** puis appuyez et relâchez le bouton **reset** pour passer en mode configuration
2. A l'aide de la commande `Azure IoT Device Workbench: Configure Device Settings`, choisissez `Config Device Connection String`, puis `Input IoT Hub Device Connection String`, et collez la connection string complète générée au début de l'atelier.

Nous pouvons maintenant déployer notre code. Toujours à l'aide de la commande de palettes, sélectionnez `Azure IoT Device Workbench: Upload Device Code`.
L'opération peut prendre quelques minutes. Pendant ce temps-là, la LED "programming" sur la board devrait clignoter. 

<div class="tip" data-title="Astuce">

> **Vous n'avez pas de MXChip sous la main et vous voulez tout de même tester cela ?**
> C'est possible, avec [l'émulateur](https://azure-samples.github.io/iot-devkit-web-simulator/) ! Copiez-collez le code Arduino dans l'émulateur, indiquez votre 
>chaîne de connexion à l'IoT Hub et c'est parti.

</div>

### Créer une Azure Function pour communiquer avec IoT Hub

1. Lancez la commande **Azure Functions: Create new project**,
2. Sélectionnez un répertoire,
3. Choisissez le langage C#,
4. Sélectionnez la runtime **Azure Functions v3**
5. Sélectionnez **Skip for now** lors du choix de type de fonction
6. Ajoutez le projet a votre workspace courant

<div class="info" data-title="Note">

> Si vous êtes plus à l'aise avec Python ou avec NodeJS, vous devriez pouvoir porter le code avec les SDKs correspondants. Mais dites-le nous avant de vous lancer!

</div>

Vous pouvez maintenant copier le code C# de [ce repository GitHub](https://github.com/themoaw/DevRoadShow-IOT/tree/master/src) dans votre dossier de travail.

Afin que le code fonctionne, nous devons inclure le SDK _Azure Devices_ dans notre projet. Cela s'effectue
au niveu du fichier `.csproj`. Assurez-vous que vous retrouvez les lignes de code suivantes (la ligne `PackageReference` qui inclut `Microsoft.Azure.Devices`).

```csharp
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Sdk.Functions" Version="1.0.24" />
    <PackageReference Include="Microsoft.Azure.Devices" Version="1.17.1" />
  </ItemGroup>
```

Dans le fichier `cs`, à la ligne 22, il vous faudra remplacer la référence _DeviceMX_ par celle du nom du device IoT créé au début de l'atelier.

Enfin pour déployer le code de votre fonction, faites un clic-droit sur le dossier de votre projet fonction, et cliquez sur **Deploy to Function App**. Vous pourrez alors choisir la souscription, puis l'application fonction que vous aviez créé tout au début. 

Il vous restera une dernière petite chose : faire communiquer votre Azure Function avec l'IoT Hub. Pour se faire, vous devez indiquer la chaîne de connexion à l'IoT Hub à la fonction. Nous allons passer par une variable d'environnement `iotHubConnectionString`, qui est lue par la méthode `Environment.GetEnvironmentVariable`. Nous pouvons faire cela directement via le portail Azure.

![Configuration des variables d'environnement dans Azure Function](assets/envvar-function.gif)

<div class="important" data-title="Attention">

> Nous parlons ici de la _connection string_ à l'IoT Hub, et non pas celle du Device lui-même ! Vous trouverez cette clé dans le portail Azure, sur votre IoT Hub : allez sur **Shared Access Policy**, puis cliquez sur **iothubowner*.

</div>

### Le moment de vérité !

Lancez https://mxchip-workshop.netlify.com/, puis indiquez l'URL complète de votre Azure Function. 

![Image - Récupértion de l'URL de la fonction](https://user-images.githubusercontent.com/1699357/60516369-e7ab9d00-9cdd-11e9-905d-3808b1ad7e4e.png)

Si tout se passe bien, vous devriez voir le status de votre carte, et en cliquant sur le bouton "RGB LED", la LED de votre carte devrait s'allumer !

---

## Changer la couleur de la LED

Maintenant que votre projet fonctionne, et que vous pouvez allumer et éteindre la LED à distance, essayons d'ajouter 
un peu de disco ! Nous allons maintenant faire en sorte de pouvoir choisir la couleur de la LED RGB. Jusqu'à présent,
le code permet uniquement de sélectionner les tons de rouge. Il faut donc compléter le code pour supporter le vert et 
le bleu.

Pour réaliser cela, il vous faudra retrouver les `TODO` dans le code dans le fichier `State.cs`: 

On vous laisse trouver ce qu'il faut changer dans le code.

N'hésitez pas à nous appeler à l'aide en cas de soucis !

---

## Bonus

### [Etape Bonus] Changez à distance le message

Regardez donc la méthode `DeviceTwinCallback`, c'est elle qui est appelée quand le device reçoit un message du cloud.


### [Etape cachée] Envoyez un dessin à distance

Le MXChip est équipé d'un écran LCD de 128x64px qui est capable d'afficher des dessins sommaires. Avant de tenter un envoi à distance, 
essayer de l'afficher en modifiant le code du projet Arduino. Pour vous aider, le site [pixelcraft](https://pixelcraft.cc/) vous 
permet de générer le code correspondant à votre dessin.

La méthode `Screen.draw` vous permet de dessiner cette matrice à l'écran.
Enfin, il vous faudra envoyer en JSON ce dessin depuis l'IoT Hub, et décrypter le JSON sur l'arduino. Pour tout cela, 
il vous faudra probablement les include suivants: 

```cpp
#include "RGB_LED.h"
#include <ArduinoJson.h>
```

### [Premier de la classe] Testez l'un des autres projets

La commande **Azure IoT Device Workbench: Open Examples** vous permet d'accéder à un ensemble d'exemples préassemblés. Testez-en un, comme par exemple le _DevKit Translator_.

---

## Conclusion

Bravo, vous avez fini le workshop!

### Crédit

Ce workshop a été créé par [Jim Bennett](https://github.com/jimbobbennett/MXChip-Workshop) puis traduit en français par [Christopher Maneu](https://twitter.com/cmaneu) et ré-arrangé par [Wassim Chegham](https://twitter.com/manekinekko), [Olivier Leplus](https://twitter.com/olivierleplus) et [Yohan Lasorsa](https://twitter.com/sinedied).

Vous pouvez trouver la version anglaise à [cette adresse](https://github.com/jimbobbennett/MXChip-Workshop).
