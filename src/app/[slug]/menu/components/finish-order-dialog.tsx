"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ConsumptionMethod } from "@prisma/client"
import { loadStripe } from "@stripe/stripe-js"
import { Loader2Icon } from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"
import { useContext, useTransition } from "react"
import { useForm } from "react-hook-form"
import { PatternFormat } from "react-number-format"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { createOrder } from "../actions/create-order"
import { CartContext } from "../contexts/cart"
import { isValidCpf } from "../helpers/cpf"

const formSchema = z.object({
  name: z.string().trim().min(1, {
    message: "O nome é obrigatório.",
  }),
  cpf: z
    .string()
    .trim()
    .min(1, {
      message: "O CPF é obrigatório.",
    })
    .refine((value) => isValidCpf(value), {
      message: "CPF inválido.",
    }),
})

type FormSchema = z.infer<typeof formSchema>

interface FinishOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FinishOrderDialog = ({
  open,
  onOpenChange,
}: FinishOrderDialogProps) => {
  const [isPending, startTransition] = useTransition()
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const { products } = useContext(CartContext)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
    },
    shouldUnregister: true,
  })

  const onSubmit = async (data: FormSchema) => {
    startTransition(async () => {
      try {
        const consumptionMethod =
          searchParams.get("consumptionMethod") === "TAKEAWAY"
            ? ConsumptionMethod.TAKEAWAY
            : ConsumptionMethod.DINE_IN

        const { sessionId } = await createOrder({
          name: data.name,
          cpf: data.cpf,
          products,
          slug,
          consumptionMethod,
        })

        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) return

        const stripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
        )

        await stripe?.redirectToCheckout({
          sessionId,
        })
      } catch (error) {
        console.error(error)
      }
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger />

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Finalizar Pedido</DrawerTitle>
          <DrawerDescription>
            Insira suas informações abaixo para finalizar o seu pedido
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu nome"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <PatternFormat
                        placeholder="Digite seu CPF"
                        format="###.###.###-##"
                        customInput={Input}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DrawerFooter>
                <Button
                  type="submit"
                  variant="destructive"
                  className="rounded-full w-full"
                  disabled={isPending}
                >
                  {isPending && (
                    <Loader2Icon className="animate-spin mr-2" />
                  )}
                  Finalizar
                </Button>

                <DrawerClose asChild>
                  <Button
                    variant="secondary"
                    className="w-full rounded-full"
                  >
                    Cancelar
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default FinishOrderDialog
