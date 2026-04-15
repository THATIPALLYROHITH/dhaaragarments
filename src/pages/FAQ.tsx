import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What are your shipping charges?",
      answer: "We offer free shipping on all orders across India. No minimum order value required.",
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery typically takes 5-7 business days for most locations. Metro cities receive orders within 3-5 business days.",
    },
    {
      question: "What sizes do you offer?",
      answer: "We offer sizes S, M, L, and XL for all our products. Please refer to our size chart for detailed measurements.",
    },
    {
      question: "Do you accept returns?",
      answer: "Yes, we accept returns within 7 days of delivery. Items must be unworn, unwashed, and with original tags attached.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept UPI, credit cards, and debit cards. All transactions are secure and encrypted.",
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking link via email and SMS to track your package in real-time.",
    },
    {
      question: "Do you offer exchanges?",
      answer: "Yes, we offer exchanges for different sizes or colors within 7 days of delivery, subject to availability.",
    },
    {
      question: "Are the colors shown accurate?",
      answer: "We strive to display accurate colors, but slight variations may occur due to screen settings. Contact us if you need more details.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tighter">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-muted-foreground mb-12">
            Find answers to common questions about our products and services
          </p>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-secondary border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-bold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 bg-secondary p-8 rounded-lg border border-border text-center">
            <h2 className="text-2xl font-bold mb-4 tracking-tight">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Contact our customer support team.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => navigate("/support")}>Contact Support</Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Shop
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
