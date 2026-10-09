"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { ChoiceChecklist } from "@/features/storefront/presentation/menu/choice-checklist";
import {
  DeliveryCheckoutForm,
  type DeliveryDetails,
} from "@/features/storefront/presentation/menu/delivery-checkout-form";
import {
  currency,
  type BuilderCatalogData,
  type BuilderChoice,
  type BuilderPriceChoice,
  type SelectionGroup,
} from "@/features/storefront/domain/acai-builder-data";
import { OrderSummary } from "@/features/storefront/presentation/menu/order-summary";
import type { MenuOrderProduct } from "@/features/storefront/domain/menu-types";
import {
  ApiError,
  createOrder,
  getStoreStatus,
} from "@/features/storefront/infrastructure/api-client";
import type {
  CreateOrderLine,
  OrderAcaiConfiguration,
} from "@/features/storefront/domain/order";
import type { StoreStatus } from "@/shared/domain/store-settings";

type BuilderCartItem = CreateOrderLine & { description: string };

function getProductPortions(product: MenuOrderProduct, cupSizes: BuilderPriceChoice[]) {
  const portions = product.items
    .filter((item) => item.kind === "size")
    .flatMap((item) => {
      const size = cupSizes.find((choice) => choice.id === item.id);
      return size ? Array.from({ length: item.quantity }, () => size) : [];
    });
  return portions.length
    ? portions
    : cupSizes.filter((size) => size.id === product.sizeId).slice(0, 1);
}

export function AcaiBuilder({
  selectedProduct,
  onClearProduct,
  onCartCountChange,
  catalog,
  storeIsOpen,
  whatsAppNumber,
  onStoreStatusChange,
}: {
  selectedProduct: MenuOrderProduct | null;
  onClearProduct: () => void;
  onCartCountChange: (count: number) => void;
  catalog: BuilderCatalogData;
  storeIsOpen: boolean;
  whatsAppNumber: string;
  onStoreStatusChange: (status: StoreStatus | null) => void;
}) {
  const {
    additionalFruitPrice,
    additionalToppingPrice,
    condimentPositions,
    cupSizes,
    deliveryFee,
    extras,
    flavors,
    fruits,
    sauces,
    toppings,
  } = catalog;
  const selectedCombo = selectedProduct;
  const onClearCombo = onClearProduct;
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [builderError, setBuilderError] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<{
    type: "success" | "error";
    message: string;
    orderNumber?: number;
    trackingHref?: string;
    whatsAppHref?: string;
  } | null>(null);
  const [cartItems, setCartItems] = useState<BuilderCartItem[]>([]);
  useEffect(() => {
    onCartCountChange(cartItems.length);
  }, [cartItems.length, onCartCountChange]);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    customerName: "",
    phone: "",
    postalCode: "",
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    reference: "",
    paymentMethod: "",
    needsChange: false,
    changeFor: "",
    notes: "",
  });
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [selectedSauce, setSelectedSauce] = useState<string | null>(null);
  const [selectedCondimentPosition, setSelectedCondimentPosition] = useState<
    string | null
  >(null);
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [comboServingIndex, setComboServingIndex] = useState(0);
  const [previousProductID, setPreviousProductID] = useState(selectedProduct?.id);

  function setProductDefaultItems(combo: MenuOrderProduct) {
    const comboItems = combo.items;
    if (combo.type === "gourmet") {
      setSelectedFlavor(
        comboItems.find((item) => item.kind === "flavor")?.id ?? null,
      );
      setSelectedSauce(
        comboItems.find((item) => item.kind === "sauce")?.id ?? "none",
      );
      setSelectedCondimentPosition(
        comboItems.find((item) => item.kind === "condiment_position")?.id ??
          "bottom",
      );
    } else {
      setSelectedFlavor(null);
      setSelectedSauce(null);
      setSelectedCondimentPosition(null);
    }
    setSelectedToppings(
      comboItems
        .filter((item) => item.kind === "topping")
        .flatMap((item) =>
          Array.from({ length: item.quantity }, () => item.id),
        ),
    );
    setSelectedFruits(
      comboItems
        .filter((item) => item.kind === "fruit")
        .flatMap((item) =>
          Array.from({ length: item.quantity }, () => item.id),
        ),
    );
    setSelectedExtras(
      comboItems
        .filter((item) => item.kind === "extra")
        .flatMap((item) =>
          Array.from({ length: item.quantity }, () => item.id),
        ),
    );
  }

  if (selectedProduct?.id !== previousProductID) {
    setPreviousProductID(selectedProduct?.id);
    if (selectedCombo) {
      setComboServingIndex(0);
      setProductDefaultItems(selectedCombo);
      setCheckoutStep(1);
    }
  }

  const comboPortions = selectedCombo
    ? getProductPortions(selectedCombo, cupSizes)
    : [];
  const comboServingCount = comboPortions.length;
  const flavor = flavors.find((item) => item.id === selectedFlavor) ?? null;
  const isFixedGourmet = selectedCombo?.type === "gourmet";
  const size = selectedCombo ? (comboPortions[comboServingIndex] ?? null) : null;
  const toppingAllowance = isFixedGourmet
    ? selectedToppings.length
    : (selectedCombo?.includedToppings ?? 0);
  const fruitAllowance = isFixedGourmet
    ? selectedFruits.length
    : (selectedCombo?.includedFruits ?? 0);
  const extrasAllowance = isFixedGourmet
    ? selectedExtras.length
    : (selectedCombo?.includedExtras ?? 0);
  const selectedExtrasList = selectedExtras.flatMap((id) => {
    const extra = extras.find((item) => item.id === id);
    return extra ? [extra] : [];
  });
  const toppingsTotal = isFixedGourmet
    ? 0
    : selectedToppings.slice(toppingAllowance).reduce(
        (total, id) =>
          total + (toppings.find((item) => item.id === id)?.price ?? 0),
        0,
      );
  const fruitsTotal = isFixedGourmet
    ? 0
    : selectedFruits.slice(fruitAllowance).reduce(
        (total, id) =>
          total + (fruits.find((item) => item.id === id)?.price ?? 0),
        0,
      );
  const extrasTotal = isFixedGourmet
    ? 0
    : selectedExtrasList
        .slice(extrasAllowance)
        .reduce((total, item) => total + item.price, 0);
  const selectedPosition =
    condimentPositions.find((item) => item.id === selectedCondimentPosition) ??
    null;
  const condimentPosition =
    isFixedGourmet && selectedPosition
      ? { ...selectedPosition, price: 0 }
      : selectedPosition;
  const comboPriceCents = selectedCombo
    ? Math.floor(selectedCombo.priceCents / comboServingCount) +
      (comboServingIndex < selectedCombo.priceCents % comboServingCount ? 1 : 0)
    : 0;
  const comboPrice = selectedCombo ? comboPriceCents / 100 : (size?.price ?? 0);
  const currentItemSubtotal = isFixedGourmet
    ? comboPrice
    : comboPrice +
      toppingsTotal +
      fruitsTotal +
      extrasTotal +
      (condimentPosition?.price ?? 0);
  const cartSubtotal = cartItems.reduce(
    (subtotal, item) => subtotal + item.estimatedSubtotalCents / 100,
    0,
  );
  const hasCurrentConfiguration = Boolean(flavor && size);
  const currentHasSelections = Boolean(
    selectedFlavor ||
    selectedToppings.length ||
    selectedSauce ||
    selectedCondimentPosition ||
    selectedFruits.length ||
    selectedExtras.length,
  );
  const canAddToCart =
    storeIsOpen && hasCurrentConfiguration && cartItems.length < 100;
  const total =
    cartSubtotal +
    (hasCurrentConfiguration ? currentItemSubtotal : 0) +
    deliveryFee;

  function choicePriceLabel(
    choice: BuilderChoice,
    selected: string[],
    included: number,
    price: number,
  ) {
    const selectedIndex = selected.indexOf(choice.id);
    if (selectedIndex >= 0) {
      return selectedIndex < included
        ? "incluído"
        : `+ ${currency.format(price)}`;
    }
    return selected.length < included
      ? "incluído ao selecionar"
      : `+ ${currency.format(price)}`;
  }

  function toggleChoice(
    id: string,
    selected: string[],
    setSelected: (next: string[]) => void,
  ) {
    setSelected(
      selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    );
  }

  function requestSelection(group: SelectionGroup, id: string) {
    if (isFixedGourmet) return;
    const groupState = {
      toppings: {
        selected: selectedToppings,
        setSelected: setSelectedToppings,
      },
      fruits: {
        selected: selectedFruits,
        setSelected: setSelectedFruits,
      },
      extras: {
        selected: selectedExtras,
        setSelected: setSelectedExtras,
      },
    }[group];

    if (groupState.selected.includes(id)) {
      toggleChoice(id, groupState.selected, groupState.setSelected);
      return;
    }
    toggleChoice(id, groupState.selected, groupState.setSelected);
  }

  function updateDeliveryDetails(
    field: keyof DeliveryDetails,
    value: string | boolean,
  ) {
    setDeliveryDetails(
      (current) =>
        ({
          ...current,
          [field]: value,
        }) as DeliveryDetails,
    );
  }

  function resetCurrentSelections() {
    setSelectedFlavor(null);
    setSelectedToppings([]);
    setSelectedSauce(null);
    setSelectedCondimentPosition(null);
    setSelectedFruits([]);
    setSelectedExtras([]);
  }

  function clearCurrentConfiguration() {
    resetCurrentSelections();
    setComboServingIndex(0);
    onClearCombo();
  }

  function addCurrentToCart() {
    if (!storeIsOpen) {
      setBuilderError("A loja está fechada e não está aceitando pedidos agora.");
      return false;
    }
    if (!flavor || !size) {
      setBuilderError(
        "Escolha o sabor e o tamanho para adicionar ao carrinho.",
      );
      return false;
    }
    if (cartItems.length >= 100) {
      setBuilderError("O carrinho aceita até 100 açaís por pedido.");
      return false;
    }

    const acai: OrderAcaiConfiguration = {
      flavorId: flavor.id,
      sizeId: size.id,
      comboId: selectedCombo?.type === "combo" ? selectedCombo.id : "",
      gourmetId: selectedCombo?.type === "gourmet" ? selectedCombo.id : "",
      toppingIds: [...selectedToppings],
      sauceId: selectedSauce ?? "none",
      condimentPositionId: selectedCondimentPosition ?? "bottom",
      fruitIds: [...selectedFruits],
      extraIds: [...selectedExtras],
    };
    const toppingNames = selectedToppings.map(
      (id) => toppings.find((item) => item.id === id)?.name ?? id,
    );
    const fruitNames = selectedFruits.map(
      (id) => fruits.find((item) => item.id === id)?.name ?? id,
    );
    const description = [
      `${flavor.name} · ${size.name}`,
      ...(selectedCombo && selectedCombo.type !== "custom"
        ? [selectedCombo.name]
        : []),
      `Acompanhamentos: ${toppingNames.join(", ") || "nenhum"}`,
      `Calda: ${selectedSauce === "none" ? "sem calda" : (sauces.find((item) => item.id === selectedSauce)?.name ?? "nenhuma")}`,
      `Condimentos: ${condimentPosition?.name ?? "padrão"}`,
      `Frutas: ${fruitNames.join(", ") || "nenhuma"}`,
      `Extras: ${selectedExtrasList.map((item) => item.name).join(", ") || "nenhum"}`,
    ].join(" · ");

    setCartItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name:
          selectedCombo?.type === "custom"
            ? selectedCombo.name
            : selectedCombo?.type === "gourmet"
              ? `${selectedCombo.name} · ${size.name}`
              : `${selectedCombo?.name} · ${size.name} · ${comboServingIndex + 1}/${comboServingCount}`,
        acai,
        estimatedSubtotalCents: Math.round(currentItemSubtotal * 100),
        description,
      },
    ]);
    const hasNextComboPortion =
      selectedCombo !== null && comboServingIndex + 1 < comboServingCount;
    resetCurrentSelections();
    if (hasNextComboPortion) {
      setComboServingIndex((index) => index + 1);
      setProductDefaultItems(selectedCombo);
    } else {
      setComboServingIndex(0);
      onClearCombo();
    }
    setBuilderError("");
    setOrderFeedback(null);
    return !hasNextComboPortion;
  }

  function removeCartItem(itemID: string) {
    setCartItems((current) => current.filter((item) => item.id !== itemID));
  }

  function goToStep(step: 1 | 2) {
    setCheckoutStep(step);
    setBuilderError("");
    setOrderFeedback(null);
    requestAnimationFrame(() => {
      document
        .getElementById("monte-seu-acai")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function continueToDelivery() {
    if (!storeIsOpen) {
      setBuilderError("A loja está fechada e não está aceitando pedidos agora.");
      return;
    }
    if (selectedCombo && !hasCurrentConfiguration) {
      setBuilderError(
        `Escolha o sabor da porção ${comboServingIndex + 1} de ${comboServingCount}.`,
      );
      return;
    }
    if (hasCurrentConfiguration) {
      if (!addCurrentToCart()) return;
    } else if (currentHasSelections) {
      setBuilderError(
        "Complete sabor e tamanho ou descarte a configuração atual.",
      );
      return;
    } else if (cartItems.length === 0) {
      setBuilderError("Adicione pelo menos um açaí ao carrinho.");
      return;
    }
    goToStep(2);
  }

  const orderMessage = [
    "Olá! Quero fazer um pedido na Jade:",
    ...cartItems.flatMap((item, index) => [
      `Item ${index + 1}: ${item.name}`,
      item.description,
      `Subtotal: ${currency.format(item.estimatedSubtotalCents / 100)}`,
      "",
    ]),
    `Subtotal dos itens: ${currency.format(cartSubtotal)}`,
    `Taxa de entrega: ${currency.format(deliveryFee)}`,
    `Total estimado: ${currency.format(total)}`,
    ...(deliveryDetails.notes.trim()
      ? [`Observações: ${deliveryDetails.notes.trim()}`]
      : []),
  ].join("\n");

  async function submitDeliveryOrder() {
    if (!storeIsOpen) {
      setOrderFeedback({
        type: "error",
        message: "A loja está fechada e não está aceitando pedidos agora.",
      });
      return;
    }
    if (cartItems.length === 0) {
      setOrderFeedback({
        type: "error",
        message: "Adicione um açaí ao carrinho antes de enviar.",
      });
      return;
    }
    const paymentNames: Record<string, string> = {
      pix: "Pix",
      cash: "Dinheiro",
      card: "Cartão na entrega",
    };
    const deliveryMessage = [
      orderMessage,
      "",
      "Dados para entrega:",
      `• Nome: ${deliveryDetails.customerName}`,
      `• WhatsApp: ${deliveryDetails.phone}`,
      `• Endereço: ${deliveryDetails.street}, ${deliveryDetails.number}`,
      `• Bairro: ${deliveryDetails.neighborhood}`,
      `• CEP: ${deliveryDetails.postalCode}`,
      ...(deliveryDetails.complement.trim()
        ? [`• Complemento: ${deliveryDetails.complement.trim()}`]
        : []),
      ...(deliveryDetails.reference.trim()
        ? [`• Referência: ${deliveryDetails.reference.trim()}`]
        : []),
      `• Pagamento: ${paymentNames[deliveryDetails.paymentMethod] ?? deliveryDetails.paymentMethod}`,
      ...(deliveryDetails.paymentMethod === "cash"
        ? [
            `• Precisa de troco: ${deliveryDetails.needsChange ? `sim, para ${currency.format(Number(deliveryDetails.changeFor))}` : "não"}`,
          ]
        : []),
    ].join("\n");
    const manualWhatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(deliveryMessage)}`;

    setIsSubmittingOrder(true);
    setOrderFeedback(null);
    try {
      const response = await createOrder({
        customer: {
          name: deliveryDetails.customerName,
          phone: deliveryDetails.phone,
        },
        acai: cartItems[0].acai,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          acai: item.acai,
          estimatedSubtotalCents: item.estimatedSubtotalCents,
        })),
        delivery: {
          postalCode: deliveryDetails.postalCode,
          street: deliveryDetails.street,
          number: deliveryDetails.number,
          neighborhood: deliveryDetails.neighborhood,
          complement: deliveryDetails.complement,
          reference: deliveryDetails.reference,
        },
        payment: {
          method: deliveryDetails.paymentMethod as "pix" | "cash" | "card",
          needsChange:
            deliveryDetails.paymentMethod === "cash" &&
            deliveryDetails.needsChange,
          changeForCents: deliveryDetails.needsChange
            ? Math.round(Number(deliveryDetails.changeFor) * 100)
            : 0,
        },
        notes: deliveryDetails.notes,
        estimatedTotalCents: Math.round(total * 100),
      });

      if (!response.persisted || !response.orderId) {
        setOrderFeedback({
          type: "error",
          message:
            "A loja não confirmou o registro do pedido. Você ainda pode falar com a loja pelo WhatsApp, mas não haverá acompanhamento online.",
          whatsAppHref: manualWhatsAppUrl,
        });
        return;
      }

      const trackingHref = `/pedido/${encodeURIComponent(response.orderId)}`;
      const whatsAppMessage = [
        `Olá! Acabei de registrar o pedido #${response.orderNumber} pelo site.`,
        `Acompanhe o status: ${window.location.origin}${trackingHref}`,
      ].join("\n");
      const whatsAppHref = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(whatsAppMessage)}`;

      setOrderFeedback({
        type: "success",
        message:
          "O pedido foi registrado com sucesso. O contato pelo WhatsApp é opcional.",
        orderNumber: response.orderNumber,
        trackingHref,
        whatsAppHref,
      });
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 409) {
        try {
          onStoreStatusChange(await getStoreStatus());
        } catch {
          onStoreStatusChange(null);
        }
        setOrderFeedback({
          type: "error",
          message:
            "A loja fechou antes da confirmação. O pedido não foi enviado.",
        });
        return;
      }

      setOrderFeedback({
        type: "error",
        message:
          "Não foi possível registrar o pedido pelo site. Se preferir, fale com a loja pelo WhatsApp; esse pedido não terá acompanhamento online.",
        whatsAppHref: manualWhatsAppUrl,
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  return (
    <section
      id="monte-seu-acai"
      className="scroll-mt-20 bg-petal px-5 py-14 md:px-8 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">
            Etapa {checkoutStep} de 2
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-crimson sm:text-4xl">
            {checkoutStep === 1
              ? (selectedCombo?.name ?? "Selecione um produto")
              : "Entrega e pagamento"}
          </h2>
          <p className="mt-3 text-base leading-7 text-crimson/75">
            {checkoutStep === 1
              ? !selectedCombo
                ? "Escolha um Combo ou Gourmet no cardápio para continuar."
                : isFixedGourmet
                  ? "Receita fixa da casa, preparada com os ingredientes descritos abaixo."
                  : comboServingCount > 1
                    ? `Porção ${comboServingIndex + 1} de ${comboServingCount} · escolha o sabor e personalize este copo.`
                    : "Escolha o sabor e personalize os complementos do produto."
              : "Informe onde entregar e como prefere pagar. Seu pedido será registrado pela loja; o WhatsApp fica disponível para contato, se precisar."}
          </p>
          <ol
            aria-label="Etapas do pedido"
            className="mt-5 flex items-center gap-3"
          >
            {["Seu açaí", "Entrega e pagamento"].map((label, index) => {
              const stepNumber = (index + 1) as 1 | 2;
              const active = checkoutStep === stepNumber;

              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    aria-current={active ? "step" : undefined}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${active ? "bg-crimson text-white" : "bg-white text-blush ring-1 ring-blush"}`}
                  >
                    {stepNumber}
                  </span>
                  <span
                    className={`text-xs font-bold ${active ? "text-crimson" : "text-blush"}`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          {checkoutStep === 1 ? (
            !selectedCombo ? (
              <p className="border border-dashed border-blush px-5 py-12 text-center text-sm font-semibold text-crimson/75">
                Escolha um Combo ou Gourmet no cardápio para configurar seu pedido.
              </p>
            ) : (
            <div className="space-y-9">
              {isFixedGourmet && selectedCombo && (
                <section className="border-y border-blush/80 py-5">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-coral">
                    Receita fixa
                  </p>
                  <p className="mt-2 text-sm leading-6 text-crimson/80">
                    {selectedCombo.description}
                  </p>
                  <p className="mt-4 text-sm font-bold text-crimson">
                    {size?.name} · {currency.format(comboPrice)}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-text">
                    {(selectedCombo.items ?? [])
                      .filter((item) => item.kind !== "size")
                      .map((item) => (
                        <li key={item.id}>
                          {item.quantity > 1 ? `${item.quantity}× ` : ""}
                          {item.name}
                        </li>
                      ))}
                  </ul>
                </section>
              )}
              <>
              <fieldset className={isFixedGourmet ? "opacity-45" : ""}>
                <legend className="text-lg font-extrabold text-crimson">
                  <span className="mr-2 text-coral">01</span> Sabor do açaí
                </legend>
                <p className="mt-1 text-sm text-crimson/75">
                  Escolha entre açaí de banana e açaí de morango.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {flavors.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selectedFlavor === item.id}
                      disabled={isFixedGourmet}
                      onClick={() => setSelectedFlavor(item.id)}
                      className={`flex min-h-14 items-center justify-between rounded-md border px-4 py-3 text-left text-sm font-bold transition-colors ${selectedFlavor === item.id ? "border-crimson bg-white text-crimson" : "border-blush bg-cream/70 text-text hover:border-coral"}`}
                    >
                      {item.name}
                      {selectedFlavor === item.id && (
                        <CheckIcon aria-hidden="true" size={18} weight="bold" />
                      )}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-lg font-extrabold text-crimson">
                  <span className="mr-2 text-coral">02</span> Tamanho selecionado
                </legend>
                <p className="mt-1 text-sm font-semibold text-crimson/75">
                  {comboServingCount > 1
                    ? `Porção ${comboServingIndex + 1} de ${comboServingCount} · `
                    : ""}
                  {size?.name} · {currency.format(comboPrice)}
                </p>
              </fieldset>

              <div className="space-y-2">
                <ChoiceChecklist
                  title="Acompanhamentos"
                  number="03"
                  description={`${toppingAllowance} acompanhamentos incluídos neste combo; cada adicional custa ${currency.format(additionalToppingPrice)}.`}
                  choices={toppings}
                  selected={selectedToppings}
                  disabled={isFixedGourmet}
                  onToggle={(id) => requestSelection("toppings", id)}
                  priceLabel={(choice) =>
                    choicePriceLabel(
                      choice,
                      selectedToppings,
                      toppingAllowance,
                      additionalToppingPrice,
                    )
                  }
                />
              </div>

              <fieldset className={isFixedGourmet ? "opacity-45" : ""}>
                <legend className="text-lg font-extrabold text-crimson">
                  <span className="mr-2 text-coral">04</span> Caldas
                </legend>
                <p className="mt-1 text-sm text-crimson/75">
                  Escolha uma calda grátis ou marque “Sem calda”.
                </p>
                <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
                  {sauces.map((sauce) => (
                    <label
                      key={sauce.id}
                      className="flex min-h-12 cursor-pointer items-center justify-between gap-3 border-b border-blush/80 py-2 text-sm text-text"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="acai-sauce"
                          value={sauce.id}
                          checked={selectedSauce === sauce.id}
                          disabled={isFixedGourmet}
                          onChange={() => setSelectedSauce(sauce.id)}
                          className="h-4 w-4 accent-crimson"
                        />
                        <span className="font-semibold">{sauce.name}</span>
                      </span>
                      <span className="text-xs font-semibold text-crimson/75">
                        grátis
                      </span>
                    </label>
                  ))}
                  <label className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-blush/80 py-2 text-sm text-text">
                    <input
                      type="radio"
                      name="acai-sauce"
                      value="none"
                      checked={selectedSauce === "none"}
                      disabled={isFixedGourmet}
                      onChange={() => setSelectedSauce("none")}
                      className="h-4 w-4 accent-crimson"
                    />
                    <span className="font-semibold">Sem calda</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className={isFixedGourmet ? "opacity-45" : ""}>
                <legend className="text-lg font-extrabold text-crimson">
                  <span className="mr-2 text-coral">05</span> Posição dos
                  condimentos
                </legend>
                <p className="mt-1 text-sm text-crimson/75">
                  Escolha onde os condimentos serão colocados no copo.
                </p>
                <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
                  {condimentPositions.map((position) => (
                    <label
                      key={position.id}
                      className="flex min-h-12 cursor-pointer items-center justify-between gap-3 border-b border-blush/80 py-2 text-sm text-text"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="condiment-position"
                          value={position.id}
                          checked={selectedCondimentPosition === position.id}
                          disabled={isFixedGourmet}
                          onChange={() =>
                            setSelectedCondimentPosition(position.id)
                          }
                          className="h-4 w-4 accent-crimson"
                        />
                        <span className="font-semibold">{position.name}</span>
                      </span>
                      <span className="text-xs font-semibold text-crimson/75">
                        {position.price > 0
                          ? `+ ${currency.format(position.price)}`
                          : "incluído"}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-2">
                <ChoiceChecklist
                  title="Frutas"
                  number="06"
                  description={`${fruitAllowance === 0 ? "Nenhuma fruta incluída" : `${fruitAllowance} ${fruitAllowance === 1 ? "fruta incluída" : "frutas incluídas"}`} neste combo; cada fruta adicional custa ${currency.format(additionalFruitPrice)}.`}
                  choices={fruits}
                  selected={selectedFruits}
                  disabled={isFixedGourmet}
                  onToggle={(id) => requestSelection("fruits", id)}
                  priceLabel={(choice) =>
                    choicePriceLabel(
                      choice,
                      selectedFruits,
                      fruitAllowance,
                      additionalFruitPrice,
                    )
                  }
                />
              </div>

              <fieldset className={isFixedGourmet ? "opacity-45" : ""}>
                <legend className="text-lg font-extrabold text-crimson">
                  <span className="mr-2 text-coral">07</span> Extras
                </legend>
                <p className="mt-1 text-sm text-crimson/75">
                  {selectedCombo
                    ? `${extrasAllowance} extra incluído no combo; cada extra adicional custa ${currency.format(3)}.`
                    : `Cada extra custa ${currency.format(3)}.`}
                </p>
                <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
                  {extras.map((item) => (
                    <label
                      key={item.id}
                      className="flex min-h-12 cursor-pointer items-center justify-between gap-3 border-b border-blush/80 py-2 text-sm text-text"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedExtras.includes(item.id)}
                          disabled={isFixedGourmet}
                          onChange={() => requestSelection("extras", item.id)}
                          className="h-4 w-4 accent-crimson"
                        />
                        <span className="font-semibold">{item.name}</span>
                      </span>
                      <span className="text-xs font-semibold text-crimson/75">
                        {selectedExtras.includes(item.id) &&
                        selectedExtras.indexOf(item.id) < extrasAllowance
                          ? "incluído"
                          : selectedCombo &&
                              selectedExtras.length < extrasAllowance
                            ? "incluído ao selecionar"
                            : `+ ${currency.format(item.price)}`}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              </>

              {builderError && (
                <p
                  role="alert"
                  className="text-sm font-extrabold text-destructive"
                >
                  {builderError}
                </p>
              )}
            </div>
            )
          ) : (
            <DeliveryCheckoutForm
              details={deliveryDetails}
              onChange={updateDeliveryDetails}
              onBack={() => goToStep(1)}
              onSubmit={submitDeliveryOrder}
              orderTotal={total}
              isSubmitting={isSubmittingOrder}
              storeIsOpen={storeIsOpen}
              orderFeedback={orderFeedback}
            />
          )}

          <OrderSummary
            selectedCombo={selectedCombo}
            comboServingNumber={comboServingIndex + 1}
            comboServingCount={comboServingCount}
            cartItems={cartItems.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              subtotalCents: item.estimatedSubtotalCents,
            }))}
            cartSubtotal={cartSubtotal}
            hasCurrentConfiguration={hasCurrentConfiguration}
            currentHasSelections={currentHasSelections}
            canAddToCart={canAddToCart && !isSubmittingOrder}
            storeIsOpen={storeIsOpen}
            onAddToCart={addCurrentToCart}
            onClearCurrent={clearCurrentConfiguration}
            onRemoveCartItem={removeCartItem}
            flavorName={flavor?.name ?? null}
            sizeName={size?.name ?? null}
            comboPrice={comboPrice}
            deliveryFee={deliveryFee}
            total={total}
            selectedToppingCount={selectedToppings.length}
            sauceSummary={
              selectedSauce === null
                ? "a escolher"
                : selectedSauce === "none"
                  ? "nenhuma · grátis"
                  : `${sauces.find((sauce) => sauce.id === selectedSauce)?.name} · grátis`
            }
            condimentPosition={condimentPosition}
            selectedFruitCount={selectedFruits.length}
            toppingsTotal={toppingsTotal}
            fruitsTotal={fruitsTotal}
            selectedExtras={selectedExtrasList}
            extrasAllowance={extrasAllowance}
            checkoutStep={checkoutStep}
            onContinueToDelivery={continueToDelivery}
          />
        </div>
        <p className="mt-8 text-sm text-crimson/75">
          Preços são estimativas do protótipo e serão confirmados no pedido.
        </p>
      </div>
    </section>
  );
}
