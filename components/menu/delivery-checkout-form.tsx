import { useRef, useState, type FormEvent } from "react";
import { ArrowLeftIcon, WhatsappLogoIcon } from "@phosphor-icons/react";

export type DeliveryDetails = {
  customerName: string;
  phone: string;
  postalCode: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  reference: string;
  paymentMethod: string;
  needsChange: boolean;
  changeFor: string;
  notes: string;
};

type DeliveryCheckoutFormProps = {
  details: DeliveryDetails;
  onChange: (field: keyof DeliveryDetails, value: string | boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
  orderTotal: number;
  isSubmitting: boolean;
  orderFeedback: { type: "success" | "error"; message: string } | null;
};

const inputClassName =
  "min-h-12 w-full rounded-md border border-blush bg-cream px-3 py-2 text-sm text-text outline-none transition focus:border-crimson focus:ring-2 focus:ring-coral/30";

const paymentMethods = [
  { id: "pix", label: "Pix" },
  { id: "cash", label: "Dinheiro" },
  { id: "card", label: "Cartão na entrega" },
];

type ViaCepResponse = {
  bairro?: string;
  erro?: boolean;
  logradouro?: string;
};

export function DeliveryCheckoutForm({
  details,
  onChange,
  onBack,
  onSubmit,
  orderTotal,
  isSubmitting,
  orderFeedback,
}: DeliveryCheckoutFormProps) {
  const [cepLookupMessage, setCepLookupMessage] = useState("");
  const [isLookingUpCep, setIsLookingUpCep] = useState(false);
  const cepLookupController = useRef<AbortController | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handlePostalCodeChange(value: string) {
    cepLookupController.current?.abort();
    cepLookupController.current = null;
    setIsLookingUpCep(false);
    setCepLookupMessage("");
    onChange("postalCode", value);
  }

  async function lookupPostalCode() {
    const digits = details.postalCode.replace(/\D/g, "");
    if (digits.length !== 8) return;

    cepLookupController.current?.abort();
    const controller = new AbortController();
    cepLookupController.current = controller;
    setIsLookingUpCep(true);
    setCepLookupMessage("");

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("CEP lookup failed");

      const address = (await response.json()) as ViaCepResponse;
      if (address.erro) {
        setCepLookupMessage(
          "CEP não encontrado. Confira ou preencha o endereço manualmente.",
        );
        return;
      }

      if (address.logradouro) onChange("street", address.logradouro);
      if (address.bairro) onChange("neighborhood", address.bairro);
      setCepLookupMessage("Endereço localizado. Confira e informe o número.");
    } catch {
      if (!controller.signal.aborted) {
        setCepLookupMessage(
          "Não foi possível consultar o CEP. Preencha o endereço manualmente.",
        );
      }
    } finally {
      if (cepLookupController.current === controller) {
        cepLookupController.current = null;
        setIsLookingUpCep(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-9">
      <fieldset>
        <legend className="text-lg font-extrabold text-crimson">
          <span className="mr-2 text-coral">01</span> Seus dados
        </legend>
        <p className="mt-1 text-sm text-crimson/75">
          Como podemos confirmar e entregar seu pedido?
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold text-text sm:col-span-2">
            Nome para o pedido
            <input
              autoComplete="name"
              required
              value={details.customerName}
              onChange={(event) => onChange("customerName", event.target.value)}
              placeholder="Seu nome"
              className={inputClassName}
            />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-text">
            WhatsApp para contato
            <input
              type="tel"
              autoComplete="tel"
              required
              value={details.phone}
              onChange={(event) => onChange("phone", event.target.value)}
              placeholder="(00) 00000-0000"
              className={inputClassName}
            />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-text">
            CEP
            <input
              inputMode="numeric"
              autoComplete="postal-code"
              required
              maxLength={9}
              value={details.postalCode}
              onChange={(event) => handlePostalCodeChange(event.target.value)}
              onBlur={() => void lookupPostalCode()}
              aria-describedby="checkout-postal-code-feedback"
              placeholder="00000-000"
              className={inputClassName}
            />
            <span
              id="checkout-postal-code-feedback"
              role="status"
              aria-live="polite"
              className="block min-h-4 text-xs font-normal text-crimson/75"
            >
              {isLookingUpCep ? "Consultando CEP..." : cepLookupMessage}
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-extrabold text-crimson">
          <span className="mr-2 text-coral">02</span> Endereço de entrega
        </legend>
        <p className="mt-1 text-sm text-crimson/75">
          Informe onde você quer receber seu pedido.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold text-text sm:col-span-2">
            Rua ou avenida
            <input
              autoComplete="address-line1"
              required
              value={details.street}
              onChange={(event) => onChange("street", event.target.value)}
              placeholder="Nome da rua ou avenida"
              className={inputClassName}
            />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-text">
            Número
            <input
              required
              value={details.number}
              onChange={(event) => onChange("number", event.target.value)}
              placeholder="Número"
              className={inputClassName}
            />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-text">
            Bairro
            <input
              autoComplete="address-level3"
              required
              value={details.neighborhood}
              onChange={(event) => onChange("neighborhood", event.target.value)}
              placeholder="Seu bairro"
              className={inputClassName}
            />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-text">
            Complemento{" "}
            <span className="font-normal text-muted">(opcional)</span>
            <input
              autoComplete="address-line2"
              value={details.complement}
              onChange={(event) => onChange("complement", event.target.value)}
              placeholder="Apto, bloco, casa..."
              className={inputClassName}
            />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-text">
            Ponto de referência{" "}
            <span className="font-normal text-muted">(opcional)</span>
            <input
              value={details.reference}
              onChange={(event) => onChange("reference", event.target.value)}
              placeholder="Próximo a..."
              className={inputClassName}
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-extrabold text-crimson">
          <span className="mr-2 text-coral">03</span> Forma de pagamento
        </legend>
        <p className="mt-1 text-sm text-crimson/75">
          Escolha como prefere pagar na confirmação do pedido.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-bold transition-colors ${details.paymentMethod === method.id ? "border-crimson bg-white text-crimson" : "border-blush bg-cream/70 text-text hover:border-coral"}`}
            >
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                required
                checked={details.paymentMethod === method.id}
                onChange={() => onChange("paymentMethod", method.id)}
                className="h-4 w-4 accent-crimson"
              />
              {method.label}
            </label>
          ))}
        </div>
        {details.paymentMethod === "cash" && (
          <div className="mt-4 space-y-3">
            <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm font-semibold text-text">
              <input
                type="checkbox"
                checked={details.needsChange}
                onChange={(event) =>
                  onChange("needsChange", event.target.checked)
                }
                className="h-4 w-4 accent-crimson"
              />
              Preciso de troco
            </label>
            {details.needsChange && (
              <label className="block max-w-xs space-y-1.5 text-sm font-semibold text-text">
                Troco para quanto?
                <input
                  type="number"
                  inputMode="decimal"
                  min={orderTotal.toFixed(2)}
                  step="0.01"
                  required
                  value={details.changeFor}
                  onChange={(event) =>
                    onChange("changeFor", event.target.value)
                  }
                  placeholder={orderTotal.toFixed(2)}
                  className={inputClassName}
                />
              </label>
            )}
          </div>
        )}
      </fieldset>

      <div>
        <label
          htmlFor="checkout-notes"
          className="text-lg font-extrabold text-crimson"
        >
          Observações do pedido
          <span className="ml-2 text-sm font-normal text-muted">
            (opcional)
          </span>
        </label>
        <textarea
          id="checkout-notes"
          value={details.notes}
          onChange={(event) => onChange("notes", event.target.value)}
          maxLength={300}
          placeholder="Alguma preferência ou detalhe para o preparo?"
          rows={3}
          className={`${inputClassName} mt-3 resize-y`}
        />
        <p className="mt-1 text-right text-xs text-crimson/75">
          {details.notes.length}/300
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-blush/70 pt-5 sm:flex-row sm:justify-between">
        {orderFeedback && (
          <p
            role={orderFeedback.type === "error" ? "alert" : "status"}
            className={`basis-full text-sm font-semibold ${orderFeedback.type === "error" ? "text-destructive" : "text-green-800"}`}
          >
            {orderFeedback.message}
          </p>
        )}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-blush px-5 text-sm font-bold text-crimson transition-colors hover:bg-petal"
        >
          <ArrowLeftIcon aria-hidden="true" size={17} /> Voltar à montagem
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-whatsapp px-5 text-sm font-extrabold text-white transition-colors hover:bg-whatsapp/90 disabled:cursor-wait disabled:opacity-60"
        >
          <WhatsappLogoIcon aria-hidden="true" size={20} weight="fill" />
          {isSubmitting ? "Enviando pedido..." : "Enviar pedido pelo WhatsApp"}
        </button>
      </div>
    </form>
  );
}
