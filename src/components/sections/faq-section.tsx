import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollReveal } from "@/components/scroll-reveal"

export function FaqSection() {
  const faqs = [
    {
      question: "Нужны ли технические знания для подключения бота?",
      answer:
        "Нет. Вы просто нажимаете кнопку «Добавить на сервер», авторизуетесь через Discord и бот появляется на вашем сервере. Никакого кода, хостинга или настройки серверов — всё работает из коробки.",
    },
    {
      question: "Что входит в комплекс ботов?",
      answer:
        "Комплекс — это набор из нескольких ботов, которые работают в связке. Например, комплекс «Игровой» включает бота экономики, бота мини-игр и бота достижений. Они интегрированы между собой и не конфликтуют.",
    },
    {
      question: "Можно ли настроить бота под свой сервер?",
      answer:
        "Да. Все боты имеют гибкие настройки через команды или панель управления: роли, каналы, сообщения, триггеры. В тарифе «Сервер под ключ» мы делаем индивидуальную настройку за вас.",
    },
    {
      question: "Как происходит оплата?",
      answer:
        "Оплата ежемесячная. Вы можете отменить подписку в любой момент. Принимаем карты российских банков, СБП и криптовалюту.",
    },
    {
      question: "Что если бот перестанет работать?",
      answer:
        "Все наши боты работают на надёжных серверах с аптаймом 99.9%. В случае сбоя наша команда устраняет проблему в течение часа. Для тарифа «Сервер под ключ» — приоритетный SLA.",
    },
  ]

  return (
    <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <ScrollReveal>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-heading font-bold tracking-tighter sm:text-5xl">
                Частые вопросы
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 opacity-70">
                Ответы на популярные вопросы о наших Discord-ботах и тарифах.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="mx-auto max-w-3xl py-12">
          <ScrollReveal>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="glassmorphic-accordion-item">
                  <AccordionTrigger className="text-left font-medium tracking-tight">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground opacity-70">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}