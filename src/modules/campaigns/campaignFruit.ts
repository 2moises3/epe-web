import mango from "@/assets/mango.webp";
import palta from "@/assets/palta.webp";
import arandano from "@/assets/arandano.webp";
import fresa from "@/assets/fresa.webp";
import banana from "@/assets/banana.webp";
import maracuya from "@/assets/maracuya.webp";
import campo from "@/assets/campo.webp";
import { identifyCampaignFruit } from "@/modules/campaigns/campaignDetails.utils";
import type { CampaignFruit } from "@/modules/campaigns/campaignDetails.utils";

interface FruitVisual {
    label: string;
    description: string;
    image: string;
    alt: string;
    quote: string;
}

const FRUIT_VISUALS: Record<CampaignFruit, FruitVisual> = {
    mango: { label: "mango", description: "de mango", image: mango, alt: "Mangos maduros en el árbol, iluminados por el sol", quote: "Mangos que inspiran oportunidades" },
    palta: { label: "palta", description: "de palta", image: palta, alt: "Paltas Hass creciendo entre hojas verdes", quote: "Del origen nace la calidad" },
    arandano: { label: "arándano", description: "de arándano", image: arandano, alt: "Arándanos maduros en su planta", quote: "Pequeños frutos, grandes oportunidades" },
    fresa: { label: "fresa", description: "de fresa", image: fresa, alt: "Fresas frescas creciendo en el campo", quote: "La dulzura de cultivar bien" },
    banana: { label: "banana", description: "de banana", image: banana, alt: "Racimo de bananas en una plantación tropical", quote: "Cultivamos energía y futuro" },
    maracuya: { label: "maracuyá", description: "de maracuyá", image: maracuya, alt: "Maracuyás dorados creciendo en la enredadera", quote: "Pasión por lo que cultivamos" },
};

const FALLBACK_VISUAL: FruitVisual = {
    label: "fruta", description: "de fruta", image: campo,
    alt: "Campos de cultivo en un valle agrícola", quote: "Del campo nacen oportunidades",
};

export function getCampaignFruitVisual(name: string, fruit?: string): FruitVisual {
    const key = identifyCampaignFruit(name, fruit);
    return key ? FRUIT_VISUALS[key] : FALLBACK_VISUAL;
}

export { campo as campaignLandscape };
