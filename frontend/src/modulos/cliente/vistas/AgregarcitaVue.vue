<template>
    <section class="page-shell">
        <h1 class="page-title">Nueva cita</h1>

        <form class="form-card" @submit.prevent="submitAppointment">
        <div class="form-grid">
            <label>
            <span>Selección de edificio</span>
            <select v-model="form.building" required>
                <option disabled value="">Selecciona un edificio</option>
                <option v-for="building in buildings" :key="building" :value="building">{{ building }}</option>
            </select>
            </label>

            <label>
            <span>Selección de médico</span>
            <select v-model="form.doctor" required>
                <option disabled value="">Selecciona un médico</option>
                <option v-for="doctor in availableDoctors" :key="doctor.name" :value="doctor.name">
                {{ doctor.name }} · {{ doctor.specialty }}
                </option>
            </select>
            </label>

            <label>
            <span>Especialidad</span>
            <input :value="selectedDoctor?.specialty ?? ''" type="text" readonly placeholder="Se llena al elegir médico" />
            </label>

            <label>
            <span>Qué día</span>
            <input v-model="form.date" :min="minDate" type="date" required />
            </label>

            <label>
            <span>A qué hora</span>
            <input v-model="form.time" type="time" min="07:00" max="19:00" step="1800" required />
            </label>

            <label>
            <span>Método de pago</span>
            <select v-model="form.paymentMethod" required>
                <option disabled value="">Selecciona una opción</option>
                <option v-for="method in paymentMethods" :key="method" :value="method">{{ method }}</option>
            </select>
            </label>

            <div v-if="form.paymentMethod === 'Tarjeta'" class="payment-card full-width">
            <div class="payment-card__header">
                <h2>Información de pago</h2>
                <p>Completa los datos de la tarjeta para registrar la cita.</p>
            </div>

            <div class="payment-grid">
                <label>
                <span>Tipo de tarjeta</span>
                <select v-model="form.cardType" required>
                    <option disabled value="">Selecciona una opción</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Débito">Débito</option>
                </select>
                </label>

                <label class="full-width">
                <span>Número de tarjeta</span>
                <input
                    v-model.trim="form.cardNumber"
                    type="text"
                    inputmode="numeric"
                    maxlength="19"
                    placeholder="1234 5678 9012 3456"
                    required
                />
                </label>

                <label class="full-width">
                <span>Nombre en la tarjeta</span>
                <input
                    v-model.trim="form.cardHolder"
                    type="text"
                    maxlength="60"
                    placeholder="Nombre del titular"
                    required
                />
                </label>

                <label>
                <span>Mes de vencimiento</span>
                <select v-model="form.expMonth" required>
                    <option disabled value="">Mes</option>
                    <option v-for="month in expirationMonths" :key="month" :value="month">{{ month }}</option>
                </select>
                </label>

                <label>
                <span>Año de vencimiento</span>
                <select v-model="form.expYear" required>
                    <option disabled value="">Año</option>
                    <option v-for="year in expirationYears" :key="year" :value="year">{{ year }}</option>
                </select>
                </label>

                <label>
                <span>Código de seguridad</span>
                <input
                    v-model.trim="form.securityCode"
                    type="password"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="CVV"
                    required
                />
                </label>
            </div>
            </div>

            <div v-else-if="form.paymentMethod === 'Transferencia'" class="payment-card full-width">
            <div class="payment-card__header">
                <h2>Información de pago</h2>
                <p>Captura los datos principales de la transferencia.</p>
            </div>

            <div class="payment-grid">
                <label>
                <span>Banco</span>
                <input v-model.trim="form.transferBank" type="text" maxlength="50" placeholder="Banco emisor" required />
                </label>

                <label>
                <span>Referencia</span>
                <input
                    v-model.trim="form.transferReference"
                    type="text"
                    maxlength="40"
                    placeholder="Número de referencia"
                    required
                />
                </label>

                <label class="full-width">
                <span>Titular de la cuenta</span>
                <input
                    v-model.trim="form.transferHolder"
                    type="text"
                    maxlength="60"
                    placeholder="Nombre del titular"
                    required
                />
                </label>

                <label>
                <span>Cuenta destino</span>
                <input
                    v-model.trim="form.transferAccount"
                    type="text"
                    inputmode="numeric"
                    maxlength="20"
                    placeholder="Últimos dígitos o cuenta"
                    required
                />
                </label>
            </div>
            </div>
        </div>

        <p v-if="errorMessage" class="feedback error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="feedback success">{{ successMessage }}</p>

        <div class="actions">
            <RouterLink class="button button-white" :to="{ name: 'citas' }">Cancelar</RouterLink>
            <button class="button" type="submit">Guardar cita</button>
        </div>
        </form>
    </section>
</template>

<script setup lang="ts">
    import { computed, reactive, ref } from 'vue'
    import { RouterLink, useRouter } from 'vue-router'
    import { useCitas } from '../controladores/useCita'

    const router = useRouter()
    const { addAppointment } = useCitas()

    const buildings = ['Edificio Central', 'Torre Norte', 'Torre Sur', 'Centro Médico Satélite']
    const doctors = [
    { name: 'Dra. Ana Martínez', specialty: 'Cardiología' },
    { name: 'Dr. Luis Herrera', specialty: 'Medicina general' },
    { name: 'Dra. Sofía Núñez', specialty: 'Dermatología' },
    { name: 'Dr. Ricardo Pérez', specialty: 'Traumatología' }
    ]
    const paymentMethods = ['Tarjeta', 'Transferencia']

    const form = reactive({
    building: '',
    doctor: '',
    date: '',
    time: '',
    paymentMethod: '',
    cardType: '',
    cardNumber: '',
    cardHolder: '',
    expMonth: '',
    expYear: '',
    securityCode: '',
    transferBank: '',
    transferReference: '',
    transferHolder: '',
    transferAccount: '',
    notes: ''
    })

    const errorMessage = ref('')
    const successMessage = ref('')
    const minDateObject = new Date()
    minDateObject.setDate(minDateObject.getDate() + 1)
    const minDate = minDateObject.toISOString().split('T')[0]

    const expirationMonths = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'))
    const currentYear = new Date().getFullYear()
    const expirationYears = Array.from({ length: 12 }, (_, index) => String(currentYear + index))

    const availableDoctors = computed(() => doctors)
    const selectedDoctor = computed(() => doctors.find((doctor) => doctor.name === form.doctor))

    const buildPaymentReference = () => {
    if (form.paymentMethod === 'Tarjeta') {
        const normalizedCardNumber = form.cardNumber.replace(/\s+/g, '')
        const lastDigits = normalizedCardNumber.slice(-4)

        return `${form.paymentMethod} ${form.cardType} · **** ${lastDigits} · ${form.cardHolder} · ${form.expMonth}/${form.expYear}`
    }

    return `${form.paymentMethod} · ${form.transferBank} · Ref ${form.transferReference} · ${form.transferHolder} · ${form.transferAccount}`
    }

    const validatePaymentInformation = () => {
    if (form.paymentMethod === 'Tarjeta') {
        const normalizedCardNumber = form.cardNumber.replace(/\s+/g, '')

        if (!form.cardType) {
        return 'Selecciona si la tarjeta es de crédito o débito.'
        }

        if (normalizedCardNumber.length < 13) {
        return 'Ingresa un número de tarjeta válido.'
        }

        if (!form.cardHolder || !form.expMonth || !form.expYear || form.securityCode.length < 3) {
        return 'Completa todos los datos de la tarjeta para continuar.'
        }
    }

    if (form.paymentMethod === 'Transferencia') {
        if (!form.transferBank || !form.transferReference || !form.transferHolder || !form.transferAccount) {
        return 'Completa todos los datos de la transferencia para continuar.'
        }
    }

    return ''
    }

    const submitAppointment = () => {
    errorMessage.value = ''
    successMessage.value = ''

    if (!selectedDoctor.value) {
        errorMessage.value = 'Selecciona un médico válido para continuar.'
        return
    }

    const selectedDateTime = new Date(`${form.date}T${form.time}:00`)

    if (Number.isNaN(selectedDateTime.getTime()) || selectedDateTime <= new Date()) {
        errorMessage.value = 'Solo puedes seleccionar una fecha y hora futuras para la cita.'
        return
    }

    const paymentError = validatePaymentInformation()

    if (paymentError) {
        errorMessage.value = paymentError
        return
    }

    addAppointment({
        building: form.building,
        doctor: form.doctor,
        specialty: selectedDoctor.value.specialty,
        date: form.date,
        time: form.time,
        paymentMethod: form.paymentMethod,
        paymentReference: buildPaymentReference(),
        notes: form.notes
    })

    successMessage.value = 'La cita se guardó correctamente. Serás redirigido a la vista principal.'

    setTimeout(() => {
        router.push({ name: 'citas' })
    }, 900)
    }
</script>

<style scoped>
    .page-shell {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    }
    .page-title {
    margin: 0 0 1rem;
    color: var(--clarus-midnight);
    }
    .form-card {
    background: var(--clarus-ivory);
    border-radius: 20px;
    box-shadow: 0 18px 45px var(--clarus-shadow);
    padding: 1.75rem;
    }
    .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    }
    label {
    display: grid;
    gap: 0.45rem;
    font-weight: 600;
    color: var(--clarus-midnight);
    }
    label span {
    font-size: 0.95rem;
    }
    input,
    select {
    width: 100%;
    border-radius: 14px;
    border: 1px solid var(--clarus-border);
    padding: 0.85rem 1rem;
    font: inherit;
    }
    .full-width {
    grid-column: 1 / -1;
    }
    .payment-card {
    border: 1px solid var(--clarus-gold-soft);
    border-radius: 18px;
    padding: 1.25rem;
    background: var(--clarus-ivory);
    }
    .payment-card__header {
    margin-bottom: 1rem;
    }
    .payment-card__header h2,
    .payment-card__header p {
    margin: 0;
    }
    .payment-card__header p {
    color: var(--clarus-oxford);
    margin-top: 0.35rem;
    }
    .payment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    }
    .button {
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border: 1px solid var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.85rem 1.4rem;
    text-decoration: none;
    font-weight: 700;
    cursor: pointer;
    }
    .button-white {
    background: var(--clarus-ivory);
    color: var(--clarus-midnight);
    }
    .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
    }
    .feedback {
    margin: 1rem 0 0;
    font-weight: 600;
    }
    .error {
    color: #b91c1c;
    }
    .success {
    color: #15803d;
    }
    @media (max-width: 768px) {
    .actions {
        flex-direction: column;
        align-items: stretch;
    }
    }
</style>