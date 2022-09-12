# Prepare your environment

To follow this workshop, you'll need:

- **Node.js**: https://nodejs.org (v12.15 minimum)
- **Git**: https://git-scm.com
- **A GitHub account**: https://github.com/join
- **A code editor**, for example: https://aka.ms/get-vscode
- **A browser**, for example: https://www.microsoft.com/edge
- **An Azure subscription**, see below for details

## Configure your Azure account

There are different ways to get a Microsoft Azure subscription.
This account is necessary to create Azure resources for this workshop.
The resources used should all be within the limits of free tiers, still it may be possible that fees are caused by following this workshop.

To help you create your Azure account, choose the option that best match your situation:

- [I already have a subscription](#already-sub)
- [I have a MSDN/Visual Studio subscription](#vss)
- [I have an Azure Pass](#azure-pass)
- [I'm a student](#student)
- [I have nothing of these](#nothing)

### I already have an Azure subscription :id=already-sub

That's excellent news! However, it will be necessary to ensure that you have the necessary authorizations in order to create resources on this subscription.

You can now [check if everything is ready for the next step](#self-check).

### I have an _Azure Pass_ :id=azure-pass

You are taking part in an event and you were provided an _azure pass_ code?
In that case, you can use it to create a subscription.
Before starting, make sure:

- To have a Microsoft account (formerly live). You can create one on [account.microsoft.com](https://account.microsoft.com),
- That this account has never been used for another Azure subscription. If you have already had a test or paying account with the same address, it will be impossible for you to use the Azure Pass. In that case, you need to create a new Microsoft account.

!> If, at any time during the registration path, your credit card information is required, it's probably that there was a mistake in the process. Ask for help of a Microsoft employee.

1. Go to [microsoftazurepass.com][azurepass] and click **Start**,
![Redeem pass](assets/redeempass-1.jpg)
2. Connect with a Microsoft Live account. **You must use a Microsoft account that is not associated with any other Azure subscription**
3. Check the email used for the account and click on **Confirm Microsoft Account**
![Confirm account](assets/redeempass-2.jpg)
4. Enter the Azure Pass code that you received, and then click **Claim Promo Code** (and no, the code present on the
 screenshot is not valid ;) ),
![Enter your code](assets/redeempass-3.jpg)
5. We are validing your account, it takes a few seconds
![Code Validation](assets/redeempass-4.jpg)
6. You will then be redirected to a last registration page. Fill out the information, and then click **Next**
![Entrer les informations](assets/redeempass-5.jpg)
7. It will only remain the legal part: accept the various contracts and declarations. Check the boxes that you accept, and if possible, click on the button **Subscribe**
![Accept legal contractss](assets/redeempass-6.jpg)

Another a few minutes of waiting, and that's it, your account is created! Take a few minutes to perform the visit and familiarize yourself with the Azure portal interface.

![Azure portal](assets/redeempass-7.jpg)

You can now [check if everything is ready for the next step](#self-check).

### I have a MSDN/Visual Studio subscription :id=vss

You have access to a free monthly credit as part of your subscription. If you have not already activated it, Just go on the [dedicated page](https://azure.microsoft.com/pricing/member-offers/credit-for-visual-studio-subscribers/?WT.mc_id=javascript-32417-yolasors)
then click on the **activate** button.

You can now [check if everything is ready for the next step](#self-check).

### I'm a student :id=student

As a student, you may have access to the **Azure For Students** offer.
To find out, go to the [dedicated page][azure-student], and click on **Activate Now**.
You will then be asked to confirm your personal information, as well as your phone number to receive a SMS validation.

!> If, at any time during the registration path, your credit card information is required, it's probably that there was a mistake in the process. Ask for help of a Microsoft employee.

Your student portal may take you directly to the Azure portal, without having any Azure subscription.
In this case, search for "Education" in the search bar at the top right. On this Education page, click on **Claim your Azure credit now** in order to start the subscription creation process.
![](assets/student-1.png)

In the case where your educational institution is not recognized, you can still [create a trial subscription](#nothing).

You can now [check if everything is ready for the next step](#self-check).

### I have nothing of these :id=nothing

You can always create a [free trial subscription][azure-free-trial]. Credit card information will be requested to make sure you are a physical person.

You can now [check if everything is ready for the next step](#self-check).

### ✅ Check if your Azure account has been created :id=self-check

Before moving on to the next step, we will ensure that your subscription
has been created. For this, follow these steps:

1. Go to [Azure portal][azure-portal],
2. In the search bar at the top of the web page, enter "Subscriptions", then click on the item ![](assets/check-01.png)
3. A list appears, where you must have an element with an active status ![](assets/check-02.png)

>The screenshot indicates a subscription name _Azure for Students_. This name may differ depending on the type of Azure subscription, as well as who created it.

**Congratulations**, You are ready for the Workshop! 🥳

[azurepass]: https://www.microsoftazurepass.com/?WT.mc_id=javascript-32417-yolasors
[azure-portal]: https://portal.azure.com/?feature.customportal=false&WT.mc_id=javascript-32417-yolasors
[azure-free-trial]: https://azure.microsoft.com/free/?WT.mc_id=javascript-32417-yolasors
[azure-student]: https://azure.microsoft.com/free/students/?WT.mc_id=javascript-32417-yolasors

---
Thanks to [Christopher Maneu](https://twitter.com/cmaneu) for these detailed instructions.
